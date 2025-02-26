import { useState } from "react";
import { trpc } from "../utils/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";

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
  const queryClient = useQueryClient();

  const { data: submission, refetch } = trpc.submissions.getById.useQuery(
    { id: submissionId! },
    { enabled: !!submissionId }
  );

  const createMutation = trpc.submissions.create.useMutation({
    onSuccess: (newSubmission) => {
      refetchSubmissions(); // Update Sidebar immediately
      // Optionally, redirect to the new submission
    },
  });

  const feedbackMutation = trpc.ai.generateFeedback.useMutation({
    onSuccess: async (stream) => {
      setIsLoading(true);
      let fullFeedback = "";
      for await (const chunk of stream) {
        fullFeedback += chunk;
        setFeedback(fullFeedback);
      }
      setIsLoading(false);
      refetch(); // Update current submission with feedback
      refetchSubmissions(); // Update Sidebar with new feedback
    },
  });

  const handleSubmit = () => {
    if (submissionId) {
      feedbackMutation.mutate({ submissionId });
    } else {
      createMutation.mutate(
        { code, language },
        {
          onSuccess: (newSubmission) =>
            feedbackMutation.mutate({ submissionId: newSubmission.id }),
        }
      );
    }
  };

  return (
    <div className="p-4">
      {submissionId && submission ? (
        <>
          <h2>Submission #{submission.id}</h2>
          <pre>{submission.code}</pre>
          <Button
            onClick={handleSubmit}
            className="bg-green-500 text-white p-2 rounded"
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Regenerate Feedback"}
          </Button>
          {feedback && <div className="mt-4">Feedback: {feedback}</div>}
        </>
      ) : (
        <>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here"
            className="w-full h-40 p-2 border"
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-2 p-2 border"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            {/* Add more languages */}
          </select>
          <Button
            onClick={handleSubmit}
            className="mt-2 bg-blue-500 text-white p-2 rounded"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Code"}
          </Button>
          {feedback && <div className="mt-4">Feedback: {feedback}</div>}
        </>
      )}
    </div>
  );
};

export default CodeSubmission;