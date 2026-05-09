import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  type Movie,
  type ListResult,
  POSTER_FALLBACK,
  BACKDROP_FALLBACK,
} from "./tmdb";

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

let genreById: Map<number, string> | null = null;
let genreByName: Map<string, number> | null = null;

async function tmdb(
  path: string,
  params: Record<string, string | number | undefined> = {},
) {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY not configured");
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", key);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== null)
      url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${await res.text()}`);
  return res.json();
}

async function getGenres() {
  if (genreById && genreByName) return { byId: genreById, byName: genreByName };
  const data = await tmdb("/genre/movie/list", { language: "en-US" });
  const byId = new Map<number, string>();
  const byName = new Map<string, number>();
  for (const g of data.genres) {
    byId.set(g.id, g.name);
    byName.set(g.name, g.id);
  }
  genreById = byId;
  genreByName = byName;
  return { byId, byName };
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
  })
  .optional();

export const tmdbDiscover = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => DiscoverSchema.parse(d) ?? {})
  .handler(async ({ data }): Promise<ListResult> => {
    const d = data || {};
    const { byId, byName } = await getGenres();
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
    const json = await tmdb("/discover/movie", params);
    return {
      results: (json.results || []).map((r: any) => mapMovie(r, byId)),
      totalPages: json.total_pages || 0,
      totalResults: json.total_results || 0,
      page: json.page || 1,
    };
  });

export const tmdbTrending = createServerFn({ method: "GET" }).handler(
  async (): Promise<Movie[]> => {
    const { byId } = await getGenres();
    const [globalJson, hiJson] = await Promise.all([
      tmdb("/trending/movie/week"),
      tmdb("/discover/movie", {
        with_original_language: "hi",
        sort_by: "popularity.desc",
        "vote_count.gte": 20,
        include_adult: "false",
      }),
    ]);
    const global = (globalJson.results || []).map((r: any) => mapMovie(r, byId));
    const bolly = (hiJson.results || []).map((r: any) => mapMovie(r, byId));
    // Interleave Hollywood + Bollywood, dedupe by id
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
  },
);

export const tmdbTopRated = createServerFn({ method: "GET" }).handler(
  async (): Promise<Movie[]> => {
    const { byId } = await getGenres();
    const [enJson, hiJson] = await Promise.all([
      tmdb("/discover/movie", {
        sort_by: "vote_average.desc",
        "vote_count.gte": 5000,
        include_adult: "false",
      }),
      tmdb("/discover/movie", {
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
  },
);

export const tmdbBollywood = createServerFn({ method: "GET" }).handler(
  async (): Promise<Movie[]> => {
    const { byId } = await getGenres();
    const json = await tmdb("/discover/movie", {
      with_original_language: "hi",
      "primary_release_date.gte": "2000-01-01",
      sort_by: "popularity.desc",
      include_adult: "false",
      "vote_count.gte": 20,
    });
    return (json.results || [])
      .slice(0, 12)
      .map((r: any) => mapMovie(r, byId));
  },
);

export const tmdbSearch = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ query: z.string(), page: z.number().optional() }).parse(d),
  )
  .handler(async ({ data }): Promise<ListResult> => {
    const { byId } = await getGenres();
    const json = await tmdb("/search/movie", {
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
  });

export const tmdbDetails = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(
    async ({ data }): Promise<Movie & { similar: Movie[] }> => {
      const { byId } = await getGenres();
      const json = await tmdb(`/movie/${data.id}`, {
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
    },
  );

export const tmdbBatch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ ids: z.array(z.string()) }).parse(d),
  )
  .handler(async ({ data }): Promise<Movie[]> => {
    if (!data.ids.length) return [];
    const { byId } = await getGenres();
    const settled = await Promise.allSettled(
      data.ids.map((id) => tmdb(`/movie/${id}`)),
    );
    return settled
      .map((r) => (r.status === "fulfilled" ? mapMovie(r.value, byId) : null))
      .filter(Boolean) as Movie[];
  });
