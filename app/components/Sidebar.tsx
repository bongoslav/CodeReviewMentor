"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Card } from "@/app/components/ui/card";
import { trpc } from "../utils/trpc";

type Submission = { id: string; code: string; language: string; feedback?: string; createdAt: string };

const Sidebar = ({
  onNewSubmission,
  setRefetchSubmissions,
  className = "",
}: {
  onNewSubmission: (submissionId: string | null) => void;
  setRefetchSubmissions: (refetch: () => void) => void;
  className?: string;
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const { data: submissions, isLoading, refetch } = trpc.submissions.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setRefetchSubmissions(() => refetch);
  }, [refetch, setRefetchSubmissions]);

  const handleNewClick = () => {
    setSelectedSubmission(null);
    onNewSubmission(null);
  };

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    onNewSubmission(submission.id);
  };

  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  return (
    <div className={`w-64 bg-gray-800 p-4 ${className}`}>
      <Button
        onClick={handleNewClick}
        variant="default"
        className="mb-4 w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        New Submission
      </Button>
      {/* TODO: add pagination */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full bg-gray-700" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {submissions?.map((submission) => (
            <Card
              key={submission.id}
              onClick={() => handleSelectSubmission(submission)}
              className={`cursor-pointer p-3 bg-gray-700 border-gray-600 ${
                selectedSubmission?.id === submission.id ? "bg-gray-600 border-blue-500" : ""
              }`}
            >
              <p className="font-medium text-gray-200">{submission.language}</p>
              <pre className="text-sm text-gray-400">{truncateText(submission.code, 20)}</pre>
              <p className="text-xs text-gray-500">
                {new Date(submission.createdAt).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;