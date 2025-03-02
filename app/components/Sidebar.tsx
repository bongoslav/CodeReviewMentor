"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Card } from "@/app/components/ui/card";
import { trpc } from "../utils/trpc";

type Submission = { id: string; code: string; language: string; feedback?: string; createdAt: string };

const ITEMS_PER_PAGE = 5;

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
  const [currentPage, setCurrentPage] = useState(1);
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

  // pagination logic
  const totalPages = submissions ? Math.ceil(submissions.length / ITEMS_PER_PAGE) : 1;
  const paginatedSubmissions = submissions
    ? submissions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      )
    : [];

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className={`w-64 bg-gray-800 p-4 ${className}`}>
      <Button
        onClick={handleNewClick}
        variant="default"
        className="mb-4 w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        New Submission
      </Button>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full bg-gray-700" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginatedSubmissions?.map((submission) => (
              <Card
                key={submission.id}
                onClick={() => handleSelectSubmission(submission)}
                className={`cursor-pointer p-3 bg-gray-700 border-gray-600 ${
                  selectedSubmission?.id === submission.id ? "bg-gray-600 border-blue-500" : ""
                }`}
              >
                <p className="text-sm text-gray-200">{truncateText(submission.code, 30)}</p>
                <p className="text-sm text-gray-400">{submission.language}</p>
                <p className="text-xs text-gray-500">
                  {new Date(submission.createdAt).toLocaleString()}
                </p>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between mt-4 items-center">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                className="px-3 py-1 text-gray-200 bg-gray-700 border-gray-600 hover:bg-gray-600 rounded-md transition duration-200"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                className="px-3 py-1 text-gray-200 bg-gray-700 border-gray-600 hover:bg-gray-600 rounded-md transition duration-200"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Sidebar;