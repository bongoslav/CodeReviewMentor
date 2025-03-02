import { Skeleton } from "./ui/skeleton";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { atomone } from "@uiw/codemirror-theme-atomone";

type SubmissionDetailsProps = {
  currentSubmission: any;
  feedback: string;
  isSubmissionLoading: boolean;
};

const SubmissionDetails = ({
  currentSubmission,
  feedback,
  isSubmissionLoading,
}: SubmissionDetailsProps) => {
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
            onChange={() => {}} // Empty handler, read-only
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
          {feedback && <p className="mt-4 text-gray-300">{feedback}</p>}
        </div>
      )}
    </>
  );
};

export default SubmissionDetails;
