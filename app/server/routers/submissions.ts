import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import prisma from "../../utils/prisma";
import { languages } from "@/app/utils/enums";

const supportedLanguages = languages.map(l => l.value) as [typeof languages[number]["value"]];

export const submissionsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        code: z
          .string()
          .min(30, "Code must be at least 30 characters long")
          .max(500, "Code must not exceed 500 characters"),
        language: z.enum(supportedLanguages, {
          errorMap: () => ({
            message: "Please select a supported programming language",
          }),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const newSubmission = await prisma.submission.create({
        data: {
          code: input.code,
          language: input.language,
          feedback: "", // initially empty, updated when generated
        },
      });

      return newSubmission;
    }),

  getAll: publicProcedure.query(async () => {
    return await prisma.submission.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),
});
