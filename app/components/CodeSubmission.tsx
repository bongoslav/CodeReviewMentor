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
  const [language, setLanguage] = useState<SupportedLanguages>(SupportedLanguages.Javascript);
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
      setLanguage(currentSubmission.language as SupportedLanguages);
      setFeedback(currentSubmission.feedback || "");
    } else {
      setCode("");
      setLanguage(SupportedLanguages.Javascript);
      setFeedback("");
    }
  }, [currentSubmission]);

  const handleSubmit = () => {
    setIsLoading(true);
    // create new submission and then generate feedback
    createMutation.mutate(
      { code, language },
      {
        onSuccess: (newSubmission) =>
          feedbackMutation.mutate({ submissionId: newSubmission.id }),
      }
    );
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
          <div className="mb-2">
            <CodeMirror
              value={code}
              extensions={language === SupportedLanguages.Javascript ? [javascript()] : []}
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
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguages)}
            className="mt-2 p-2 bg-gray-800 text-white rounded"
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
            {isLoading ? "Submitting..." : "Submit & Generate Feedback"}
          </Button>
          {feedback && <p className="mt-2 text-gray-300">{feedback}</p>}
          {isLoading && <Skeleton className="h-4 w-full mt-2 bg-gray-700" />}
        </>
      )}
    </div>
  );
};

export default CodeSubmission;
