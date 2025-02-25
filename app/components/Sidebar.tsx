"use client";

import { useState } from "react";
import { trpc } from "../utils/trpc";
import SubmissionDetail from "./SubmissionDetail";
import { Submission } from "@prisma/client";

const Sidebar = ({ onNewSubmission }: { onNewSubmission: () => void }) => {
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const { data: submissions } = trpc.submissions.getAll.useQuery();

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <>
      <div className="w-64 h-screen bg-gray-800 p-4 border-r border-gray-700 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">
          Submission History
        </h2>
        <button
          onClick={() => {
            setSelectedSubmission(null);
            onNewSubmission(); // reset CodeSubmission form
          }}
          className="mb-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
        >
          New Submission
        </button>
        <div className="space-y-2">
          {submissions?.map((submission) => (
            <div
              key={submission.id}
              className="p-3 bg-gray-700 rounded shadow hover:bg-gray-600 cursor-pointer transition-colors"
              onClick={() =>
                setSelectedSubmission({
                  ...submission,
                  createdAt: new Date(submission.createdAt),
                })
              }
            >
              <p className="text-sm font-medium text-gray-200">
                {submission.language}
              </p>
              <pre className="text-xs text-gray-300 mt-1 overflow-hidden">
                {truncateText(submission.code, 50)}
              </pre>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(submission.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {selectedSubmission && (
        <SubmissionDetail
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </>
  );
};

export default Sidebar;
