export type CastMember = { name: string; character: string; photo: string };

export type Movie = {
  id: string;
  title: string;
  year: number;
  rating: number;
  popularity: number;
  runtime?: number;
  genres: string[];
  tagline?: string;
  overview: string;
  poster: string;
  backdrop: string;
  trailerId?: string;
  cast?: CastMember[];
  language?: string;
};

export type ListResult = {
  results: Movie[];
  totalPages: number;
  totalResults: number;
  page: number;
};

export const POSTER_FALLBACK =
  "https://placehold.co/500x750/050507/00F5FF?text=NEXUS";
export const BACKDROP_FALLBACK =
  "https://placehold.co/1280x720/050507/B026FF?text=NEXUS";
