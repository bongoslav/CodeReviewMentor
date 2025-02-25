'use client';

import { trpc } from '../utils/trpc';

export default function SubmissionsList() {
  const { data: submissions, isLoading, error } = trpc.submissions.getAll.useQuery();

  if (isLoading) return <div>Loading submissions...</div>;
  if (error) return <div>Error loading submissions: {error.message}</div>;
  if (!submissions?.length) return <div>No submissions yet</div>;

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <div 
          key={submission.id} 
          className="p-4 border rounded border-gray-700 bg-gray-800"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              {submission.language}
            </span>
            <span className="text-sm text-gray-400">
              {new Date(submission.createdAt).toLocaleString()}
            </span>
          </div>
          <pre className="bg-gray-900 p-3 rounded">
            <code>{submission.code}</code>
          </pre>
          {submission.feedback && (
            <div className="mt-2 text-gray-300">
              <h4 className="font-semibold">Feedback:</h4>
              <p>{submission.feedback}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 