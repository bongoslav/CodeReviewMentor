import { z } from "zod";
import { streamText } from "ai";
import { openai } from '@ai-sdk/openai';
import { publicProcedure, router } from "../trpc";
import prisma from "../../utils/prisma";

const SYSTEM_PROMPT = `Act as a senior security engineer. Analyze the provided code for security vulnerabilities and best practices.
Format your response as:
1. Brief summary (1 sentence)
2. Key findings (bulleted list)
3. Most critical recommendation
Avoid markdown. Be technical but concise.`;

export const aiRouter = router({
  generateFeedback: publicProcedure
    .input(z.object({ submissionId: z.string() }))
    .mutation(async function* ({ input }) {
      console.log('Starting feedback generation for submission:', input.submissionId);
      const submission = await prisma.submission.findUnique({
        where: { id: input.submissionId },
      });

      if (!submission) {
        throw new Error('Submission not found');
      }

      console.log('Submission found:', submission);

      const { textStream } = streamText({
        model: openai('gpt-4o-mini'),
        prompt: SYSTEM_PROMPT,
        maxTokens: 450,
        temperature: 1,
      });

      console.log('Starting to stream AI feedback...');
      let feedback = '';
      for await (const chunk of textStream) {
        feedback += chunk;
        yield chunk;
      }
      console.log('Stream complete');

      await prisma.submission.update({
        where: { id: input.submissionId },
        data: { feedback },
      });
      console.log('Feedback saved to submission:', input.submissionId);
    }),
});
