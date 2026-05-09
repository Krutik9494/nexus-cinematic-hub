export type CastMember = { name: string; character: string; photo: string };

export type Movie = {
  id: string;
  title: string;
  year: number;
  rating: number;
  popularity: number;
  runtime: number;
  genres: string[];
  tagline: string;
  overview: string;
  poster: string;
  backdrop: string;
  trailerId: string; // YouTube ID
  cast: CastMember[];
};

const img = (id: string) => `https://image.tmdb.org/t/p/w500${id}`;
const back = (id: string) => `https://image.tmdb.org/t/p/w1280${id}`;
const face = (seed: string) => `https://i.pravatar.cc/200?u=${seed}`;

const mkCast = (names: [string, string][]): CastMember[] =>
  names.map(([name, character]) => ({ name, character, photo: face(name) }));

export const MOVIES: Movie[] = [
  {
    id: "dune2", title: "Dune: Part Two", year: 2024, rating: 8.5, popularity: 98, runtime: 166,
    genres: ["Sci-Fi", "Adventure"],
    tagline: "Long live the fighters.",
    overview: "Paul Atreides unites with the Fremen to wage war against the conspirators who destroyed his family, facing a choice between the love of his life and the fate of the universe.",
    poster: img("/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg"),
    backdrop: back("/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg"),
    trailerId: "Way9Dexny3w",
    cast: mkCast([["Timothée Chalamet","Paul Atreides"],["Zendaya","Chani"],["Rebecca Ferguson","Lady Jessica"],["Javier Bardem","Stilgar"],["Austin Butler","Feyd-Rautha"]]),
  },
  {
    id: "interstellar", title: "Interstellar", year: 2014, rating: 8.7, popularity: 95, runtime: 169,
    genres: ["Sci-Fi", "Drama"],
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    poster: img("/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"),
    backdrop: back("/pbrkL804c8yAv3zBZR4QPEafpAR.jpg"),
    trailerId: "zSWdZVtXT7E",
    cast: mkCast([["Matthew McConaughey","Cooper"],["Anne Hathaway","Brand"],["Jessica Chastain","Murph"],["Michael Caine","Prof. Brand"],["Mackenzie Foy","Young Murph"]]),
  },
  {
    id: "oppenheimer", title: "Oppenheimer", year: 2023, rating: 8.3, popularity: 92, runtime: 180,
    genres: ["Drama", "Thriller"],
    tagline: "The world forever changes.",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    poster: img("/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg"),
    backdrop: back("/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg"),
    trailerId: "uYPbbksJxIg",
    cast: mkCast([["Cillian Murphy","Oppenheimer"],["Emily Blunt","Kitty"],["Robert Downey Jr.","Strauss"],["Matt Damon","Groves"],["Florence Pugh","Jean"]]),
  },
  {
    id: "blade2049", title: "Blade Runner 2049", year: 2017, rating: 8.0, popularity: 88, runtime: 164,
    genres: ["Sci-Fi", "Mystery"],
    tagline: "The key to the future is finally unearthed.",
    overview: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
    poster: img("/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg"),
    backdrop: back("/ilrZsKCMOOJ5Lo0NZfpUaLrsMIn.jpg"),
    trailerId: "gCcx85zbxz4",
    cast: mkCast([["Ryan Gosling","K"],["Harrison Ford","Deckard"],["Ana de Armas","Joi"],["Jared Leto","Wallace"],["Sylvia Hoeks","Luv"]]),
  },
  {
    id: "tenet", title: "Tenet", year: 2020, rating: 7.4, popularity: 80, runtime: 150,
    genres: ["Action", "Sci-Fi", "Thriller"],
    tagline: "Time runs out.",
    overview: "Armed with only one word—Tenet—and fighting for the survival of the entire world, the Protagonist journeys through a twilight world of international espionage.",
    poster: img("/k68nPLbIST6NP96JmTxmZijEvCA.jpg"),
    backdrop: back("/k5h4vWmSi1oTOCVlk5TIRzkkDuY.jpg"),
    trailerId: "L3pk_TBkihU",
    cast: mkCast([["John David Washington","Protagonist"],["Robert Pattinson","Neil"],["Elizabeth Debicki","Kat"],["Kenneth Branagh","Sator"]]),
  },
  {
    id: "matrix", title: "The Matrix", year: 1999, rating: 8.7, popularity: 90, runtime: 136,
    genres: ["Sci-Fi", "Action"],
    tagline: "Welcome to the Real World.",
    overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    poster: img("/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"),
    backdrop: back("/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg"),
    trailerId: "vKQi3bBA1y8",
    cast: mkCast([["Keanu Reeves","Neo"],["Laurence Fishburne","Morpheus"],["Carrie-Anne Moss","Trinity"],["Hugo Weaving","Agent Smith"]]),
  },
  {
    id: "arrival", title: "Arrival", year: 2016, rating: 7.9, popularity: 78, runtime: 116,
    genres: ["Sci-Fi", "Drama"],
    tagline: "Why are they here?",
    overview: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
    poster: img("/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg"),
    backdrop: back("/yIZ1xendyqKvY3FGeeUYUd5X9Mm.jpg"),
    trailerId: "tFMo3UJ4B4g",
    cast: mkCast([["Amy Adams","Louise"],["Jeremy Renner","Ian"],["Forest Whitaker","Weber"]]),
  },
  {
    id: "inception", title: "Inception", year: 2010, rating: 8.8, popularity: 96, runtime: 148,
    genres: ["Sci-Fi", "Action", "Thriller"],
    tagline: "Your mind is the scene of the crime.",
    overview: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea in the mind of a CEO.",
    poster: img("/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg"),
    backdrop: back("/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg"),
    trailerId: "YoHD9XEInc0",
    cast: mkCast([["Leonardo DiCaprio","Cobb"],["Joseph Gordon-Levitt","Arthur"],["Elliot Page","Ariadne"],["Tom Hardy","Eames"],["Marion Cotillard","Mal"]]),
  },
  {
    id: "everything", title: "Everything Everywhere All at Once", year: 2022, rating: 8.0, popularity: 85, runtime: 139,
    genres: ["Sci-Fi", "Comedy", "Drama"],
    tagline: "The universe is so much bigger than you realize.",
    overview: "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes.",
    poster: img("/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg"),
    backdrop: back("/nGxUxi3PfXDRm7Vg95VBNgNM8yc.jpg"),
    trailerId: "wxN1T1uxQ2g",
    cast: mkCast([["Michelle Yeoh","Evelyn"],["Ke Huy Quan","Waymond"],["Jamie Lee Curtis","Deirdre"],["Stephanie Hsu","Joy"]]),
  },
  {
    id: "joker", title: "Joker", year: 2019, rating: 8.2, popularity: 87, runtime: 122,
    genres: ["Drama", "Thriller"],
    tagline: "Put on a happy face.",
    overview: "In Gotham City, mentally troubled comedian Arthur Fleck embarks on a downward spiral that leads to the creation of an iconic villain.",
    poster: img("/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg"),
    backdrop: back("/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg"),
    trailerId: "zAGVQLHvwOY",
    cast: mkCast([["Joaquin Phoenix","Arthur Fleck"],["Robert De Niro","Murray"],["Zazie Beetz","Sophie"]]),
  },
  {
    id: "mm", title: "Mad Max: Fury Road", year: 2015, rating: 8.1, popularity: 82, runtime: 120,
    genres: ["Action", "Sci-Fi"],
    tagline: "What a lovely day.",
    overview: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners.",
    poster: img("/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg"),
    backdrop: back("/gqrnQA6Xppdl8vIb2eJc58VC1tW.jpg"),
    trailerId: "hEJnMQG9ev8",
    cast: mkCast([["Tom Hardy","Max"],["Charlize Theron","Furiosa"],["Nicholas Hoult","Nux"]]),
  },
  {
    id: "ex", title: "Ex Machina", year: 2014, rating: 7.7, popularity: 76, runtime: 108,
    genres: ["Sci-Fi", "Drama"],
    tagline: "There is nothing more human than the will to survive.",
    overview: "A young programmer is selected to participate in a ground-breaking experiment in synthetic intelligence by evaluating the human qualities of a highly advanced humanoid A.I.",
    poster: img("/btbRB7BrD887j5NrvjxceRDmaot.jpg"),
    backdrop: back("/9YTFXigP0CQHxL3qhEyqAIzn6mW.jpg"),
    trailerId: "EoQuVnKhxaM",
    cast: mkCast([["Domhnall Gleeson","Caleb"],["Alicia Vikander","Ava"],["Oscar Isaac","Nathan"]]),
  },
];

export const GENRES = ["Sci-Fi", "Action", "Thriller", "Drama", "Mystery", "Adventure", "Comedy"];
export const ALL_GENRES = ["All", ...GENRES];

export const TRENDING = MOVIES.slice(0, 8);
export const POPULAR = MOVIES;

export const similarTo = (movie: Movie, limit = 6) =>
  MOVIES.filter((m) => m.id !== movie.id)
    .map((m) => ({ m, score: m.genres.filter((g) => movie.genres.includes(g)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.m);
