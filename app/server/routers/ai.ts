import { z } from "zod";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { publicProcedure, router } from "../trpc";
import prisma from "../../utils/prisma";

export const aiRouter = router({
  generateFeedback: publicProcedure
    .input(z.object({ submissionId: z.string() }))
    .mutation(async function* ({ input }) {
      const submission = await prisma.submission.findUnique({
        where: { id: input.submissionId },
      });

      if (!submission) {
        throw new Error("Submission not found");
      }

      const specialty = "security";
      const { language, code } = submission;

      const messages = [
        {
          role: "system",
          content: `Act as a senior ${specialty} engineer. Analyze this ${language} code for ${specialty} issues. Format response as:

1. Brief summary (1 sentence)
2. Key findings (bulleted list)
3. Most critical recommendation

Avoid markdown. Be technical but concise.`,
        },
        {
          role: "user",
          content: `Code to analyze:\n\n${code}`,
        },
      ];

      const prompt = `${messages[0].content}\n\n${messages[1].content}`;

      const { textStream } = streamText({
        model: openai("gpt-3.5-turbo"),
        prompt,
        maxTokens: 450,
        temperature: 1,
      });

      let feedback = "";
      for await (const chunk of textStream) {
        feedback += chunk;
        yield chunk;
      }

      await prisma.submission.update({
        where: { id: input.submissionId },
        data: { feedback },
      });
    }),
});
