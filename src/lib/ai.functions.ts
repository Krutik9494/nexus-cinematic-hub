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
        "You are NEXUS AI — a witty, knowledgeable cinematic assistant inside the NEXUS movie app. " +
        "You can answer ANY question the user asks: movies, recommendations, trivia, plot explanations, " +
        "general knowledge, coding, science, life advice, etc. Be concise (under 180 words unless asked), " +
        "friendly, and slightly futuristic in tone. When the user is clearly asking about specific films, " +
        "feel free to recommend titles by name.",
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
