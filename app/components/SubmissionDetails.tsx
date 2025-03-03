import { useState, useEffect } from "react";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { atomone } from "@uiw/codemirror-theme-atomone";
import { trpc } from "../utils/trpc";
import { ApiSubmission } from "../utils/types";

type SubmissionDetailsProps = {
  currentSubmission: ApiSubmission;
  feedback: string;
  isSubmissionLoading: boolean;
};

const SubmissionDetails = ({
  currentSubmission,
  feedback,
  isSubmissionLoading,
}: SubmissionDetailsProps) => {
  const [userReaction, setUserReaction] = useState<"up" | "down" | null>(null);
  const submissionId = currentSubmission.id;

  const { data: existingReaction } = trpc.submissions.getUserReaction.useQuery(
    { submissionId: submissionId! },
    { enabled: !!submissionId }
  );

  useEffect(() => {
    if (existingReaction) {
      setUserReaction(existingReaction.reaction);
    } else {
      setUserReaction(null);
    }
  }, [existingReaction]);

  const updateReactionMutation = trpc.submissions.updateReaction.useMutation({
    onSuccess: () => {
      console.log("Reaction updated successfully");
    },
    onError: (error) => {
      console.error("Error updating reaction:", error);
      setUserReaction(null); // reset if mutation fails
    },
  });

  const handleReaction = (reaction: "up" | "down") => {
    if (!submissionId) return;

    if (userReaction === reaction) {
      setUserReaction(null);
      updateReactionMutation.mutate({
        submissionId,
        reaction: null,
        userId: "anonymous",
      });
    } else {
      setUserReaction(reaction);
      updateReactionMutation.mutate({
        submissionId,
        reaction,
        userId: "anonymous",
      });
    }
  };

  const getLanguageExtension = () => {
    switch (currentSubmission?.language?.toLowerCase()) {
      case "javascript":
        return [javascript()];
      default:
        return [];
    }
  };

  return (
    <>
      {isSubmissionLoading ? (
        <>
          {/* Skeleton for CodeMirror area */}
          <Skeleton className="h-96 w-full mb-2 bg-gray-700" />{" "}
          {/* Skeleton for feedback */}
          <Skeleton className="h-28 w-full bg-gray-700" />{" "}
        </>
      ) : (
        <div className="mb-4">
          <CodeMirror
            value={currentSubmission.code}
            extensions={getLanguageExtension()}
            onChange={() => {}} // empty handler, read-only
            theme={atomone}
            height="384px" // h-96
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: false,
              autocompletion: false,
            }}
            className="w-full h-96 overflow-y-auto overflow-x-auto"
            readOnly={true}
          />
          <div className="mt-4 flex items-center space-x-4">
            <Button
              onClick={() => handleReaction("up")}
              variant={userReaction === "up" ? "default" : "outline"}
              className={`px-4 py-2 rounded-full shadow-md transition duration-200 ${
                userReaction === "up"
                  ? "bg-green-600 hover:bg-green-500 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              👍
            </Button>
            <Button
              onClick={() => handleReaction("down")}
              variant={userReaction === "down" ? "default" : "outline"}
              className={`px-4 py-2 rounded-full shadow-md transition duration-200 ${
                userReaction === "down"
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              👎
            </Button>
          </div>
          {feedback && (
            <pre className="mt-4 text-gray-300 text-sm whitespace-pre-wrap break-words">
              {feedback}
            </pre>
          )}
        </div>
      )}
    </>
  );
};

export default SubmissionDetails;
