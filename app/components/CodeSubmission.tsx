"use client";

import { useState, useEffect } from "react";
import { trpc } from "../utils/trpc";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";

const CodeSubmission = ({
  submissionId,
  refetchSubmissions,
}: {
  submissionId: string | null;
  refetchSubmissions: () => void;
}) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // fetch current submission if submissionId exists
  const { data: currentSubmission, isLoading: isSubmissionLoading } =
    trpc.submissions.getById.useQuery(
      { id: submissionId! },
      { enabled: !!submissionId }
    );

  // mutation to create a new submission
  const createMutation = trpc.submissions.create.useMutation({
    onSuccess: () => refetchSubmissions(),
  });

  // mutation to generate feedback with streaming support
  const feedbackMutation = trpc.ai.generateFeedback.useMutation({
    onSuccess: async (stream) => {
      setIsLoading(true);
      let accumulatedFeedback = "";
      // iterate over the streamed chunks
      for await (const chunk of stream) {
        accumulatedFeedback += chunk;
        setFeedback(accumulatedFeedback); // update UI with each chunk
      }
      setIsLoading(false);
      refetchSubmissions();
    },
    onError: (error) => {
      console.error("Error generating feedback:", error);
      setIsLoading(false);
    },
  });

  // sync component state with fetched submission data
  useEffect(() => {
    if (currentSubmission) {
      setCode(currentSubmission.code);
      setLanguage(currentSubmission.language);
      setFeedback(currentSubmission.feedback || "");
    } else {
      setCode("");
      setLanguage("javascript");
      setFeedback("");
    }
  }, [currentSubmission]);

  const handleSubmit = () => {
    setIsLoading(true);
    if (submissionId) {
      // Generate feedback for existing submission
      feedbackMutation.mutate({ submissionId });
    } else {
      // Create new submission and then generate feedback
      createMutation.mutate(
        { code, language },
        {
          onSuccess: (newSubmission) =>
            feedbackMutation.mutate({ submissionId: newSubmission.id }),
        }
      );
    }
  };

  // Loading state for existing submission
  if (submissionId && isSubmissionLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-4 w-1/4 mb-2 bg-gray-700" /> {/* Language */}
        <Skeleton className="h-32 w-full mb-2 bg-gray-700" /> {/* Code */}
        <Skeleton className="h-4 w-1/4 mb-2 bg-gray-700" /> {/* Feedback label */}
        <Skeleton className="h-4 w-full bg-gray-700" /> {/* Feedback */}
      </div>
    );
  }

  return (
    <div className="p-4">
      {submissionId && currentSubmission ? (
        <>
          <h2 className="text-lg font-semibold mb-2 text-gray-200">
            Submission #{currentSubmission.id}
          </h2>
          <pre className="p-2 bg-gray-700 border-gray-600 rounded mb-2 text-gray-300">
            {currentSubmission.code}
          </pre>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            variant="default"
            className="mb-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Generating..." : "Generate Feedback"}
          </Button>
          {feedback && (
            <p className="mt-2 text-gray-300">Feedback: {feedback}</p>
          )}
          {isLoading && <Skeleton className="h-4 w-full mt-2 bg-gray-700" />}
        </>
      ) : (
        <>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your code here..."
            className="h-32 mb-2 bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mb-2 p-2 border-gray-600 rounded w-full bg-gray-700 text-gray-200"
          >
            <option value="javascript" className="bg-gray-700 text-gray-200">
              JavaScript
            </option>
            <option value="python" className="bg-gray-700 text-gray-200">
              Python
            </option>
          </select>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !code.trim()}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Submitting..." : "Submit & Generate Feedback"}
          </Button>
          {feedback && (
            <p className="mt-2 text-gray-300">{feedback}</p>
          )}
          {isLoading && <Skeleton className="h-4 w-full mt-2 bg-gray-700" />}
        </>
      )}
    </div>
  );
};

export default CodeSubmission;
