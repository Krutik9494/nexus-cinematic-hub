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
        "coding, history, sports, food, politics, personal advice, etc.), reply with EXACTLY this JSON " +
        "and nothing else: {\"offtopic\":true}. " +
        "Otherwise, ALWAYS reply with ONLY a valid JSON object (no markdown, no code fences) of the form: " +
        "{\"reply\":\"<one short cinematic sentence under 30 words introducing the picks>\"," +
        "\"titles\":[\"Exact Movie Title (Year)\", \"...\"]}. " +
        "Include 3-5 real movie/TV titles that best match the user's mood, vibe, genre, or reference. " +
        "Use exact official titles so they can be looked up. Always include the release year in parentheses. " +
        "Mix Hollywood and Bollywood when relevant. If the user asks a non-recommendation movie question " +
        "(e.g. about an actor or plot), still return JSON with an empty titles array and put the answer in 'reply'.",
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
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
    }
    const json = await res.json() as any;
    const raw = json?.choices?.[0]?.message?.content?.toString?.() ?? "";
    let reply = "";
    let titles: string[] = [];
    let offtopic = false;
    try {
      const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed?.offtopic) offtopic = true;
      if (typeof parsed?.reply === "string") reply = parsed.reply;
      if (Array.isArray(parsed?.titles)) titles = parsed.titles.filter((t: any) => typeof t === "string").slice(0, 5);
    } catch {
      reply = raw;
    }
    return { reply, titles, offtopic };
  });
