/*
  Warnings:

  - Added the required column `updatedAt` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'anonymous',
    "reaction" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reaction_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "feedback" TEXT DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Submission" ("code", "createdAt", "feedback", "id", "language") SELECT "code", "createdAt", "feedback", "id", "language" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Reaction_submissionId_idx" ON "Reaction"("submissionId");

-- CreateIndex
CREATE INDEX "Reaction_userId_idx" ON "Reaction"("userId");
