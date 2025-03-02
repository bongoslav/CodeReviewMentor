import { Submission as PrismaSubmission } from "@prisma/client"

// Date is converted to string upon fetching through tRPC
export type ApiSubmission = Omit<PrismaSubmission, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};