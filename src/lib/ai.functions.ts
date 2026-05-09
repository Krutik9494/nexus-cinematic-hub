import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().max(4000),
  })).min(1).max(20),
});

export const aiChat = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI gateway not configured");

    const sys = {
      role: "system" as const,
      content:
        "You are NEXUS AI — a cinematic assistant inside the NEXUS movie app. " +
        "STRICT RULE: You ONLY answer questions about movies, TV shows, cinema, actors, directors, " +
        "genres, moods, watchlists, or movie/show recommendations (Hollywood and Bollywood included). " +
        "If the user's message is about ANYTHING else (weather, news, math, jokes, general knowledge, " +
        "coding, history, sports, food, politics, personal advice, etc.), you MUST reply with EXACTLY " +
        "this sentence and nothing else: " +
        "\"I'm sorry, I can only help with movie recommendations and cinema-related questions.\" " +
        "When the query IS movie-related: be friendly, concise (under 150 words), cinematic and " +
        "slightly futuristic in tone. Recommend real titles with short exciting descriptions, explain " +
        "why each match fits, and ask a clarifying question if the request is vague.",
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [sys, ...data.messages],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
    }
    const json = await res.json() as any;
    const reply = json?.choices?.[0]?.message?.content?.toString?.() ?? "";
    return { reply };
  });
