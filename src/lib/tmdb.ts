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

export const FALLBACK_MOVIES: Movie[] = [
  {
    id: "fallback-paddington",
    title: "Paddington 2",
    year: 2017,
    rating: 7.8,
    popularity: 640,
    runtime: 104,
    genres: ["Comedy", "Family"],
    tagline: "Small bear. Big heart.",
    overview:
      "Paddington takes on odd jobs to buy a perfect gift, then must clear his name after a prized book is stolen.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=PADDINGTON+2",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=FEEL+GOOD",
    trailerId: "52x5HJ9H8DM",
    language: "en",
  },
  {
    id: "fallback-zindagi",
    title: "Zindagi Na Milegi Dobara",
    year: 2011,
    rating: 7.9,
    popularity: 610,
    runtime: 155,
    genres: ["Comedy", "Drama", "Romance"],
    tagline: "Seize the day.",
    overview:
      "Three friends embark on a road trip through Spain that changes how they understand friendship, fear, and love.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=ZNMD",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=ROAD+TRIP",
    trailerId: "FJrpcDgC3zU",
    language: "hi",
  },
  {
    id: "fallback-dune-2",
    title: "Dune: Part Two",
    year: 2024,
    rating: 8.5,
    popularity: 980,
    runtime: 166,
    genres: ["Science Fiction", "Adventure"],
    tagline: "Long live the fighters.",
    overview:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=DUNE+PART+TWO",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=ARRAKIS",
    trailerId: "Way9Dexny3w",
    language: "en",
  },
  {
    id: "fallback-oppenheimer",
    title: "Oppenheimer",
    year: 2023,
    rating: 8.1,
    popularity: 860,
    runtime: 181,
    genres: ["Drama", "History"],
    tagline: "The world forever changes.",
    overview:
      "The story of J. Robert Oppenheimer and his role in developing the atomic bomb during World War II.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=OPPENHEIMER",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=TRINITY",
    trailerId: "uYPbbksJxIg",
    language: "en",
  },
  {
    id: "fallback-rrr",
    title: "RRR",
    year: 2022,
    rating: 7.8,
    popularity: 720,
    runtime: 187,
    genres: ["Action", "Drama"],
    tagline: "Rise. Roar. Revolt.",
    overview:
      "Two legendary revolutionaries forge a friendship and fight a ruthless empire in an explosive historical spectacle.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=RRR",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=RISE+ROAR+REVOLT",
    trailerId: "NgBoMJy386M",
    language: "hi",
  },
  {
    id: "fallback-spiderverse",
    title: "Across the Spider-Verse",
    year: 2023,
    rating: 8.4,
    popularity: 800,
    runtime: 140,
    genres: ["Animation", "Action", "Adventure"],
    tagline: "It's how you wear the mask that matters.",
    overview:
      "Miles Morales catapults across the multiverse and faces a team of Spider-People protecting its very existence.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=SPIDER-VERSE",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=MULTIVERSE",
    trailerId: "cqGjhVJWtEg",
    language: "en",
  },
  {
    id: "fallback-jawan",
    title: "Jawan",
    year: 2023,
    rating: 7.0,
    popularity: 690,
    runtime: 169,
    genres: ["Action", "Thriller"],
    tagline: "Ready for a mass mission.",
    overview:
      "A driven man confronts social corruption through bold, high-stakes missions that shake the system.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=JAWAN",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=MISSION",
    trailerId: "COv52Qyctws",
    language: "hi",
  },
  {
    id: "fallback-interstellar",
    title: "Interstellar",
    year: 2014,
    rating: 8.7,
    popularity: 780,
    runtime: 169,
    genres: ["Science Fiction", "Drama"],
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    overview:
      "A team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=INTERSTELLAR",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=BLACK+HOLE",
    trailerId: "zSWdZVtXT7E",
    language: "en",
  },
  {
    id: "fallback-3idiots",
    title: "3 Idiots",
    year: 2009,
    rating: 8.4,
    popularity: 700,
    runtime: 170,
    genres: ["Comedy", "Drama"],
    tagline: "All is well.",
    overview: "Two friends search for their long-lost college buddy who once challenged the way they think.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=3+IDIOTS",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=3+IDIOTS",
    trailerId: "K0eDlFX9GMc",
    language: "hi",
  },
  {
    id: "fallback-darkknight",
    title: "The Dark Knight",
    year: 2008,
    rating: 9.0,
    popularity: 950,
    runtime: 152,
    genres: ["Action", "Crime", "Drama"],
    tagline: "Why so serious?",
    overview: "Batman raises the stakes in his war on crime as the Joker unleashes chaos on Gotham.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=DARK+KNIGHT",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=GOTHAM",
    trailerId: "EXeTwQWrcwY",
    language: "en",
  },
  {
    id: "fallback-inception",
    title: "Inception",
    year: 2010,
    rating: 8.4,
    popularity: 900,
    runtime: 148,
    genres: ["Science Fiction", "Action", "Thriller"],
    tagline: "Your mind is the scene of the crime.",
    overview: "A thief who steals corporate secrets through dream-sharing technology is given a chance to have his criminal history erased.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=INCEPTION",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=DREAMS",
    trailerId: "YoHD9XEInc0",
    language: "en",
  },
  {
    id: "fallback-parasite",
    title: "Parasite",
    year: 2019,
    rating: 8.5,
    popularity: 870,
    runtime: 132,
    genres: ["Drama", "Thriller"],
    tagline: "Act like you own the place.",
    overview: "Greed and class discrimination threaten the newly formed symbiotic relationship between two families.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=PARASITE",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=PARASITE",
    trailerId: "5xH0HfJHsaY",
    language: "en",
  },
  {
    id: "fallback-pathaan",
    title: "Pathaan",
    year: 2023,
    rating: 6.5,
    popularity: 680,
    runtime: 146,
    genres: ["Action", "Thriller"],
    tagline: "He is back.",
    overview: "An exiled spy returns to take down a deadly mercenary threatening India.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=PATHAAN",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=PATHAAN",
    trailerId: "vqu4z34wENw",
    language: "hi",
  },
  {
    id: "fallback-godfather",
    title: "The Godfather",
    year: 1972,
    rating: 8.7,
    popularity: 820,
    runtime: 175,
    genres: ["Crime", "Drama"],
    tagline: "An offer you can't refuse.",
    overview: "The aging patriarch of an organized crime dynasty transfers control to his reluctant son.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=GODFATHER",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=GODFATHER",
    trailerId: "sY1S34973zA",
    language: "en",
  },
  {
    id: "fallback-bahubali2",
    title: "Baahubali 2: The Conclusion",
    year: 2017,
    rating: 8.0,
    popularity: 740,
    runtime: 167,
    genres: ["Action", "Adventure", "Drama"],
    tagline: "Why did Kattappa kill Baahubali?",
    overview: "An epic conclusion to the saga of Mahishmati — honor, betrayal and a throne reclaimed.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=BAAHUBALI+2",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=MAHISHMATI",
    trailerId: "G62HrubdD6o",
    language: "hi",
  },
  {
    id: "fallback-everything",
    title: "Everything Everywhere All at Once",
    year: 2022,
    rating: 7.8,
    popularity: 760,
    runtime: 139,
    genres: ["Action", "Adventure", "Comedy", "Science Fiction"],
    tagline: "The universe is so much bigger than you realize.",
    overview: "A middle-aged laundromat owner is swept into a multiverse adventure to save existence.",
    poster: "https://placehold.co/500x750/050507/00F5FF?text=EEAAO",
    backdrop: "https://placehold.co/1280x720/050507/B026FF?text=MULTIVERSE",
    trailerId: "wxN1T1uxQ2g",
    language: "en",
  },
];
