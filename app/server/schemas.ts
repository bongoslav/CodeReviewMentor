import { z } from "zod";
import { supportedLanguages } from "../utils/enums";

export const submissionSchema = z.object({
  id: z.string(),
  code: z
    .string()
    .min(30, "Code must be at least 30 characters long")
    .max(500, "Code must not exceed 500 characters"),
  language: z.enum(supportedLanguages, {
    errorMap: () => ({
      message: "Please select a supported programming language",
    }),
  }),
  feedback: z.string(),
  createdAt: z.date(),
});

export type Submission = z.infer<typeof submissionSchema>;
