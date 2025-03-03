# Code Review Application

A web app for submitting code, generating AI security feedback, and tracking reactions.  
Submit code snippets, view AI feedback, react with thumbs up/down, and navigate submissions.

## Important Functionalities
- Code submission (30-500 chars, Javascript/Python/Java)
- AI feedback generation (streaming)
- Feedback reactions (thumbs up/down)
- Submission pagination (5/page)
- Real-time updates
- Error handling (AI, DB, validation)

## Database Schema
```prisma
model Submission {
  id        String     @id @default(cuid())
  code      String
  language  String
  feedback  String?    @default("")
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  reactions Reaction[]

  @@index([createdAt])
}

model Reaction {
  id           String     @id @default(cuid())
  submission   Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  submissionId String
  userId       String     @default("anonymous")
  reaction     String // "up" or "down"
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([submissionId])
  @@index([userId])
}
```

## API Endpoints
- `ai.generateFeedback`: `mutation` - Generate streaming AI feedback
- `submissions.create`: `mutation` - Create submission (`{code, language, feedback}`)
- `submissions.getAll`: `query` - List submissions (sorted by `createdAt` desc)
- `submissions.getById`: `query` - Get submission by ID
- `submissions.updateReaction`: `mutation` - Update reaction (`{submissionId, reaction, userId?}`)

## Tech Stack
- **Backend**: tRPC, Prisma, SQLite3
- **Frontend**: React, Next.js, Tailwind CSS, Shadcn/ui, @trpc/react-query
- **AI**: Vercel AI SDK, OpenAI API
- **Other**: TypeScript, Zod

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
```
and `.env.local` with:
```
OPENAI_API_KEY=your-key
```
5. `npx prisma db push`

## Running
1. `npm run dev`
2. Open `http://localhost:3000`
3. Stop with `Ctrl + C`

## License
MIT License