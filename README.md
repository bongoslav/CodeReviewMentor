# Code Review Application

A web app for submitting code, generating AI security feedback, and tracking reactions with pagination.

## Getting Started
Submit code snippets, view AI feedback, react with thumbs up/down, and navigate submissions.

## Prerequisites
- Node.js (v18.x+)
- npm (v8.x+)
- SQLite3
- Git

## Installation
1. `git clone https://github.com/yourusername/code-review-app.git`
2. `cd code-review-app`
3. `npm install`
4. Create `.env` with:

```
DATABASE_URL=file:./prisma/dev.db
NEXT_PUBLIC_API_URL=http://localhost:3000/api/trpc
OPENAI_API_KEY=your-key
```
5. `npx prisma db push`

## Running
1. `npm run dev`
2. Open `http://localhost:3000`
3. Stop with `Ctrl + C`

## Important Functionalities
- Code submission (30-500 chars, JavaScript/Python/Java)
- AI feedback generation (streaming)
- Feedback reactions (thumbs up/down)
- Submission pagination (5/page)
- Real-time updates
- Error handling (AI, DB, validation)

## Database Schema
```prisma
model Submission {
id        Int      @id @default(autoincrement())
code      String   @db.Text
language  String
feedback  String?  @db.Text
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
reactions Reaction[]

@@index([createdAt])
}

model Reaction {
id          Int       @id @default(autoincrement())
submission  Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
submissionId Int
userId      String    @default("anonymous")
reaction    String    @db.Text
createdAt   DateTime  @default(now())

@@index([submissionId])
@@index([userId])
@@unique([submissionId, userId])
}
```

## API Endpoints
- `submissions.create`: `mutation` - Create submission (`{code, language, feedback}`)
- `submissions.getAll`: `query` - List submissions (sorted by `createdAt` desc)
- `submissions.getById`: `query` - Get submission by ID
- `submissions.updateReaction`: `mutation` - Update reaction (`{submissionId, reaction, userId?}`)

## Tech Stack
- **Frontend**: React, Next.js, Tailwind CSS, CodeMirror, @trpc/react-query
- **Backend**: tRPC, Prisma, SQLite3
- **AI**: Vercel AI SDK, OpenAI API
- **Other**: TypeScript, Zod

## License
MIT License