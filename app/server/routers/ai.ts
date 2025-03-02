import { z } from "zod";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { publicProcedure, router } from "../trpc";

export const aiRouter = router({
  generateFeedback: publicProcedure
    .input(z.object({ code: z.string(), language: z.string() }))
    .mutation(async function* ({ input }) {
      const specialty = "security";

      const messages = [
        {
          role: "system",
          content: `Act as a senior ${specialty} engineer. Analyze this ${input.language} code for ${specialty} issues. Format response as:

1. Brief summary (1 sentence)
2. Key findings (bulleted list)
3. Most critical recommendation

Avoid markdown. Be technical but concise.`,
        },
        {
          role: "user",
          content: `Code to analyze:\n\n${input.code}`,
        },
      ];

      const prompt = `${messages[0].content}\n\n${messages[1].content}`;

      const { textStream } = streamText({
        model: openai("gpt-3.5-turbo"),
        prompt,
        maxTokens: 450,
        temperature: 1,
      });

      for await (const chunk of textStream) {
        yield chunk;
      }
    }),
});
