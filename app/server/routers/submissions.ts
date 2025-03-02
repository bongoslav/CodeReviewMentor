import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import prisma from "../../utils/prisma";
import { SupportedLanguages } from "@/app/utils/enums";

export const submissionsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        code: z
          .string()
          .min(30, "Code must be at least 30 characters long")
          .max(500, "Code must not exceed 500 characters"),
        language: z.nativeEnum(SupportedLanguages, {
          errorMap: () => ({ message: "Invalid language" }),
        }),
        feedback: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const newSubmission = await prisma.submission.create({
        data: {
          code: input.code,
          language: input.language,
          feedback: input.feedback,
        },
      });

      return newSubmission;
    }),

  getAll: publicProcedure.query(async () => {
    return await prisma.submission.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await prisma.submission.findUnique({ where: { id: input.id } });
    }),

  updateReaction: publicProcedure
    .input(
      z.object({
        submissionId: z.string(),
        reaction: z.enum(["up", "down"]),
        userId: z.string().optional(), // if we extend with authentication at some point
      })
    )
    .mutation(async ({ input }) => {
      const { submissionId, reaction, userId = "anonymous" } = input;

      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
      });

      if (!submission) {
        throw new Error("Submission not found");
      }

      const existingReaction = await prisma.reaction.findFirst({
        where: { submissionId, userId },
      });

      if (existingReaction) {
        await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { reaction },
        });
      } else {
        await prisma.reaction.create({
          data: {
            submissionId,
            userId,
            reaction,
          },
        });
      }

      return { success: true };
    }),
});
