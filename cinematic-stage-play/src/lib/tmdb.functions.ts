import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  type Movie,
  type ListResult,
  POSTER_FALLBACK,
  BACKDROP_FALLBACK,
  FALLBACK_MOVIES,
} from "./tmdb";

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";
const OMDB = "https://www.omdbapi.com/";

const genreCache = new Map<string, { byId: Map<number, string>; byName: Map<string, number> }>();

// In-memory poster cache for OMDB lookups (server-side, persists per worker).
const omdbPosterCache = new Map<string, string | null>();

async function omdbPosterFor(title: string, year?: number, overrideKey?: string): Promise<string | null> {
  const apiKey = overrideKey || process.env.OMDB_API_KEY;
  const key = `${apiKey ? "k" : "e"}|${title.toLowerCase()}|${year ?? ""}`;
  if (omdbPosterCache.has(key)) return omdbPosterCache.get(key) ?? null;
  if (!apiKey) {
    omdbPosterCache.set(key, null);
    return null;
  }
  try {
    const url = new URL(OMDB);
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("t", title);
    if (year) url.searchParams.set("y", String(year));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`OMDB ${res.status}`);
    const json = await res.json();
    const poster: string | null =
      json && json.Response === "True" && typeof json.Poster === "string" && json.Poster.startsWith("http")
        ? json.Poster
        : null;
    omdbPosterCache.set(key, poster);
    return poster;
  } catch {
    omdbPosterCache.set(key, null);
    return null;
  }
}

async function enrichWithOmdb<T extends Movie>(movies: T[], overrideKey?: string): Promise<T[]> {
  if (!overrideKey && !process.env.OMDB_API_KEY) return movies;
  const enriched = await Promise.all(
    movies.map(async (m) => {
      if (!m.poster || m.poster.includes("placehold.co")) {
        const poster = await omdbPosterFor(m.title, m.year, overrideKey);
        if (poster) return { ...m, poster, backdrop: poster };
      }
      return m;
    }),
  );
  return enriched;
}

async function tmdb(
  apiKey: string,
  path: string,
  params: Record<string, string | number | undefined> = {},
) {
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", apiKey);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== null)
      url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${await res.text()}`);
  return res.json();
}

function resolveKey(input?: string): string {
  const key = input || process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY not configured");
  return key;
}

async function getGenres(apiKey: string) {
  const cached = genreCache.get(apiKey);
  if (cached) return cached;
  const data = await tmdb(apiKey, "/genre/movie/list", { language: "en-US" });
  const byId = new Map<number, string>();
  const byName = new Map<string, number>();
  for (const g of data.genres) {
    byId.set(g.id, g.name);
    byName.set(g.name, g.id);
  }
  const out = { byId, byName };
  genreCache.set(apiKey, out);
  return out;
}

function mapMovie(raw: any, byId: Map<number, string>): Movie {
  const genres: string[] = raw.genres
    ? raw.genres.map((g: any) => g.name)
    : (raw.genre_ids || [])
        .map((id: number) => byId.get(id))
        .filter(Boolean) as string[];
  return {
    id: String(raw.id),
    title: raw.title || raw.original_title || "Untitled",
    year: raw.release_date ? Number(raw.release_date.slice(0, 4)) : 0,
    rating: raw.vote_average || 0,
    popularity: raw.popularity || 0,
    runtime: raw.runtime,
    genres,
    tagline: raw.tagline || "",
    overview: raw.overview || "",
    poster: raw.poster_path ? `${IMG}/w500${raw.poster_path}` : POSTER_FALLBACK,
    backdrop: raw.backdrop_path
      ? `${IMG}/w1280${raw.backdrop_path}`
      : BACKDROP_FALLBACK,
    language: raw.original_language,
  };
}

function listResult(results: Movie[], page = 1): ListResult {
  return {
    results,
    totalPages: 1,
    totalResults: results.length,
    page,
  };
}

function fallbackDiscover(filters: {
  sortBy?: string;
  genres?: string[];
  minRating?: number;
  language?: string;
  page?: number;
} = {}) {
  let results = [...FALLBACK_MOVIES];
  if (filters.language) results = results.filter((m) => m.language === filters.language);
  if (filters.genres?.length) {
    results = results.filter((m) => filters.genres!.some((g) => m.genres.includes(g)));
  }
  if (filters.minRating) results = results.filter((m) => m.rating >= filters.minRating!);
  if (filters.sortBy === "vote_average.desc") results.sort((a, b) => b.rating - a.rating);
  else if (filters.sortBy === "primary_release_date.desc") results.sort((a, b) => b.year - a.year);
  else results.sort((a, b) => b.popularity - a.popularity);
  return listResult(results, filters.page || 1);
}

function fallbackSearch(query: string, page = 1) {
  const q = query.toLowerCase();
  const results = FALLBACK_MOVIES.filter((m) =>
    [m.title, m.overview, m.tagline || "", ...m.genres].some((value) =>
      value.toLowerCase().includes(q),
    ),
  );
  return listResult(results.length ? results : FALLBACK_MOVIES.slice(0, 4), page);
}

const ApiKeyOnly = z.object({ apiKey: z.string().optional() }).optional();

const DiscoverSchema = z
  .object({
    sortBy: z.string().optional(),
    genres: z.array(z.string()).optional(),
    yearMin: z.number().optional(),
    yearMax: z.number().optional(),
    minRating: z.number().optional(),
    language: z.string().optional(),
    region: z.string().optional(),
    page: z.number().optional(),
    apiKey: z.string().optional(),
  })
  .optional();

export const tmdbDiscover = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => DiscoverSchema.parse(d) ?? {})
  .handler(async ({ data }): Promise<ListResult> => {
    const d = data || {};
    try {
      const apiKey = resolveKey(d.apiKey);
      const { byId, byName } = await getGenres(apiKey);
      const params: Record<string, string | number> = {
        sort_by: d.sortBy || "popularity.desc",
        page: d.page || 1,
        include_adult: "false",
        "vote_count.gte": 50,
      };
      if (d.yearMin) params["primary_release_date.gte"] = `${d.yearMin}-01-01`;
      if (d.yearMax) params["primary_release_date.lte"] = `${d.yearMax}-12-31`;
      if (d.minRating) params["vote_average.gte"] = d.minRating;
      if (d.language) params.with_original_language = d.language;
      if (d.region) params.region = d.region;
      if (d.genres?.length) {
        const ids = d.genres
          .map((n) => byName.get(n))
          .filter(Boolean) as number[];
        if (ids.length) params.with_genres = ids.join(",");
      }
      const json = await tmdb(apiKey, "/discover/movie", params);
      return {
        results: (json.results || []).map((r: any) => mapMovie(r, byId)),
        totalPages: json.total_pages || 0,
        totalResults: json.total_results || 0,
        page: json.page || 1,
      };
    } catch {
      const fb = fallbackDiscover(d);
      return { ...fb, results: await enrichWithOmdb(fb.results) };
    }
  });

export const tmdbTrending = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => ApiKeyOnly.parse(d) ?? {})
  .handler(async ({ data }): Promise<Movie[]> => {
    try {
      const apiKey = resolveKey(data?.apiKey);
      const { byId } = await getGenres(apiKey);
      const [globalJson, hiJson] = await Promise.all([
        tmdb(apiKey, "/trending/movie/week"),
        tmdb(apiKey, "/discover/movie", {
          with_original_language: "hi",
          sort_by: "popularity.desc",
          "vote_count.gte": 20,
          include_adult: "false",
        }),
      ]);
      const global = (globalJson.results || []).map((r: any) => mapMovie(r, byId));
      const bolly = (hiJson.results || []).map((r: any) => mapMovie(r, byId));
      const out: Movie[] = [];
      const seen = new Set<string>();
      const max = Math.max(global.length, bolly.length);
      for (let i = 0; i < max && out.length < 16; i++) {
        for (const m of [global[i], bolly[i]]) {
          if (m && !seen.has(m.id)) {
            seen.add(m.id);
            out.push(m);
          }
        }
      }
      return out;
    } catch {
      return enrichWithOmdb(FALLBACK_MOVIES);
    }
  });

export const tmdbTopRated = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => ApiKeyOnly.parse(d) ?? {})
  .handler(async ({ data }): Promise<Movie[]> => {
    try {
      const apiKey = resolveKey(data?.apiKey);
      const { byId } = await getGenres(apiKey);
      const [enJson, hiJson] = await Promise.all([
        tmdb(apiKey, "/discover/movie", {
          sort_by: "vote_average.desc",
          "vote_count.gte": 5000,
          include_adult: "false",
        }),
        tmdb(apiKey, "/discover/movie", {
          with_original_language: "hi",
          sort_by: "vote_average.desc",
          "vote_count.gte": 200,
          include_adult: "false",
        }),
      ]);
      const en = (enJson.results || []).map((r: any) => mapMovie(r, byId));
      const hi = (hiJson.results || []).map((r: any) => mapMovie(r, byId));
      const out: Movie[] = [];
      const seen = new Set<string>();
      const max = Math.max(en.length, hi.length);
      for (let i = 0; i < max && out.length < 16; i++) {
        for (const m of [en[i], hi[i]]) {
          if (m && !seen.has(m.id)) {
            seen.add(m.id);
            out.push(m);
          }
        }
      }
      return out.sort((a, b) => b.rating - a.rating);
    } catch {
      return enrichWithOmdb([...FALLBACK_MOVIES].sort((a, b) => b.rating - a.rating));
    }
  });

export const tmdbBollywood = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => ApiKeyOnly.parse(d) ?? {})
  .handler(async ({ data }): Promise<Movie[]> => {
    try {
      const apiKey = resolveKey(data?.apiKey);
      const { byId } = await getGenres(apiKey);
      const json = await tmdb(apiKey, "/discover/movie", {
        with_original_language: "hi",
        "primary_release_date.gte": "2000-01-01",
        sort_by: "popularity.desc",
        include_adult: "false",
        "vote_count.gte": 20,
      });
      return (json.results || [])
        .slice(0, 12)
        .map((r: any) => mapMovie(r, byId));
    } catch {
      return enrichWithOmdb(FALLBACK_MOVIES.filter((m) => m.language === "hi"));
    }
  });

export const tmdbSearch = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        query: z.string(),
        page: z.number().optional(),
        apiKey: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<ListResult> => {
    try {
      const apiKey = resolveKey(data.apiKey);
      const { byId } = await getGenres(apiKey);
      const json = await tmdb(apiKey, "/search/movie", {
        query: data.query,
        page: data.page || 1,
        include_adult: "false",
      });
      return {
        results: (json.results || []).map((r: any) => mapMovie(r, byId)),
        totalPages: json.total_pages || 0,
        totalResults: json.total_results || 0,
        page: json.page || 1,
      };
    } catch {
      const fb = fallbackSearch(data.query, data.page || 1);
      return { ...fb, results: await enrichWithOmdb(fb.results) };
    }
  });

export const tmdbDetails = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ id: z.string(), apiKey: z.string().optional() }).parse(d),
  )
  .handler(
    async ({ data }): Promise<Movie & { similar: Movie[] }> => {
      try {
        const apiKey = resolveKey(data.apiKey);
        const { byId } = await getGenres(apiKey);
        const json = await tmdb(apiKey, `/movie/${data.id}`, {
          append_to_response: "credits,videos,similar",
        });
        const m = mapMovie(json, byId);
        const videos = json.videos?.results || [];
        const trailer =
          videos.find(
            (v: any) =>
              v.site === "YouTube" && v.type === "Trailer" && v.official,
          ) ||
          videos.find((v: any) => v.site === "YouTube" && v.type === "Trailer") ||
          videos.find((v: any) => v.site === "YouTube");
        m.trailerId = trailer?.key;
        m.cast = (json.credits?.cast || []).slice(0, 12).map((c: any) => ({
          name: c.name,
          character: c.character || "",
          photo: c.profile_path
            ? `${IMG}/w185${c.profile_path}`
            : `https://i.pravatar.cc/200?u=${encodeURIComponent(c.name)}`,
        }));
        const similar = (json.similar?.results || [])
          .slice(0, 8)
          .map((r: any) => mapMovie(r, byId));
        return { ...m, similar };
      } catch {
        const fallback = FALLBACK_MOVIES.find((m) => m.id === data.id) || FALLBACK_MOVIES[0];
        const similar = FALLBACK_MOVIES.filter((m) => m.id !== fallback.id).slice(0, 6);
        const [enrichedMain, enrichedSimilar] = await Promise.all([
          enrichWithOmdb([fallback]),
          enrichWithOmdb(similar),
        ]);
        return {
          ...enrichedMain[0],
          cast: fallback.cast || [],
          similar: enrichedSimilar,
        };
      }
    },
  );

export const tmdbBatch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({ ids: z.array(z.string()), apiKey: z.string().optional() })
      .parse(d),
  )
  .handler(async ({ data }): Promise<Movie[]> => {
    if (!data.ids.length) return [];
    try {
      const apiKey = resolveKey(data.apiKey);
      const { byId } = await getGenres(apiKey);
      const settled = await Promise.allSettled(
        data.ids.map((id) => tmdb(apiKey, `/movie/${id}`)),
      );
      return settled
        .map((r) => (r.status === "fulfilled" ? mapMovie(r.value, byId) : null))
        .filter(Boolean) as Movie[];
    } catch {
      const byId = new Map(FALLBACK_MOVIES.map((m) => [m.id, m]));
      const matched = data.ids.map((id) => byId.get(id)).filter(Boolean) as Movie[];
      return enrichWithOmdb(matched);
    }
  });

export const tmdbVerifyKey = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ apiKey: z.string().min(1) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    try {
      await tmdb(data.apiKey, "/configuration");
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Invalid key" };
    }
  });

export const omdbVerifyKey = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ apiKey: z.string().min(1) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    try {
      const url = new URL(OMDB);
      url.searchParams.set("apikey", data.apiKey);
      url.searchParams.set("t", "Inception");
      const res = await fetch(url.toString());
      const json = await res.json();
      if (json && json.Response === "True") return { ok: true };
      return { ok: false, error: json?.Error || "Invalid key" };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Network error" };
    }
  });
