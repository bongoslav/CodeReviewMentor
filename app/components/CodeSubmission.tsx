"use client";

import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { atomone } from "@uiw/codemirror-theme-atomone";
import { trpc } from "../utils/trpc";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import SubmissionDetails from "./SubmissionDetails";
import { SupportedLanguages } from "../utils/enums";

const CodeSubmission = ({
  submissionId,
  refetchSubmissions,
}: {
  submissionId: string | null;
  refetchSubmissions: () => void;
}) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<SupportedLanguages>(
    SupportedLanguages.Javascript
  );
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch current submission if submissionId exists
  const { data: currentSubmission, isLoading: isSubmissionLoading } =
    trpc.submissions.getById.useQuery(
      { id: submissionId! },
      { enabled: !!submissionId }
    );

  // mutation to create a submission
  const createMutation = trpc.submissions.create.useMutation({
    onSuccess: () => {
      refetchSubmissions();
      setError(null);
    },
    onError: (error) => {
      console.error("Error creating submission:", error);
      if (error.data?.zodError) {
        const zodError = JSON.stringify(error.data.zodError, null, 2);
        setError(zodError);
      } else {
        setError("Failed to save submission. Please try again.");
      }
    },
  });

  // mutation to generate feedback with streaming
  const feedbackMutation = trpc.ai.generateFeedback.useMutation({
    onSuccess: async (stream) => {
      setIsLoading(true);
      let accumulatedFeedback = "";

      for await (const chunk of stream) {
        accumulatedFeedback += chunk;
        setFeedback(accumulatedFeedback);
      }

      setIsLoading(false);

      createMutation.mutate({
        code,
        language,
        feedback: accumulatedFeedback,
      });
    },
    onError: (error) => {
      console.error("Error generating feedback:", error);
      setError("Failed to generate feedback. Please try again.");
      setIsLoading(false);
    },
  });

  // sync component state with fetched submission data
  useEffect(() => {
    if (currentSubmission) {
      setCode(currentSubmission.code);
      setLanguage(currentSubmission.language as SupportedLanguages);
      setFeedback(currentSubmission.feedback || "");
    } else {
      setCode("");
      setLanguage(SupportedLanguages.Javascript);
      setFeedback("");
    }
  }, [currentSubmission]);

  const isValidCode = code.length >= 30 && code.length <= 500;
  const isValidLanguage = Object.values(SupportedLanguages).includes(language);

  const handleSubmit = () => {
    if (!isValidCode) {
      setError("Code must be between 30 and 500 characters.");
      return;
    }
    if (!isValidLanguage) {
      setError("Please select a valid language.");
      return;
    }
    setError(null);
    setFeedback("");
    setIsLoading(true);
    feedbackMutation.mutate({ code, language });
  };

  return (
    <div className="p-4">
      {submissionId ? (
        <SubmissionDetails
          currentSubmission={currentSubmission}
          feedback={feedback}
          isSubmissionLoading={isSubmissionLoading}
        />
      ) : (
        <>
          <div className="mb-4">
            <CodeMirror
              value={code}
              extensions={
                language === SupportedLanguages.Javascript ? [javascript()] : []
              }
              onChange={(value) => setCode(value)}
              theme={atomone}
              height="384px" // h-96
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                autocompletion: true,
              }}
              className="w-full h-96 overflow-y-auto overflow-x-auto"
            />
          </div>
          <div className="flex flex-row space-x-4 items-center">
            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as SupportedLanguages)
              }
              className="p-2 bg-gray-800 text-white rounded"
            >
              {Object.values(SupportedLanguages).map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !code.trim()}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Generating..." : "Generate Feedback"}
            </Button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {feedback && (
            <pre className="mt-4 text-gray-300 text-sm whitespace-pre-wrap break-words max-w-prose">
              {feedback}
            </pre>
          )}
          {isLoading && <Skeleton className="h-4 w-full mt-4 bg-gray-700" />}
        </>
      )}
    </div>
  );
};

export default CodeSubmission;
