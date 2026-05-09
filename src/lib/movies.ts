// Static genre list (TMDB movie genres) and helpers — runtime data lives in tmdb.functions.ts
export type { Movie, CastMember, ListResult } from "./tmdb";

export const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
  "War",
  "Western",
];

export const ALL_GENRES = ["All", ...GENRES];
