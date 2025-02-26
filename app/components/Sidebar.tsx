import { useEffect, useState } from "react";
import { trpc } from "../utils/trpc";
import { Button } from "./ui/button";

type Submission = { id: string; code: string; language: string; feedback?: string };

const Sidebar = ({ 
  onNewSubmission,
  setRefetchSubmissions,
}: {
  onNewSubmission: (submissionId: string | null) => void;
  setRefetchSubmissions: (refetch: () => void) => void;
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const { data: submissions, refetch } = trpc.submissions.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false, // Prevent refetch on tab switch
  });

  // Provide the refetch function to the parent
  useEffect(() => {
    setRefetchSubmissions(() => refetch);
  }, [refetch, setRefetchSubmissions]);

  const handleNewClick = () => {
    setSelectedSubmission(null);
    onNewSubmission(null); // Signal a new submission
  };

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    onNewSubmission(submission.id);
  };

  return (
    <div className="w-64 bg-gray-100 p-4">
      <Button
        onClick={handleNewClick}
        className="mb-4 bg-blue-500 text-white p-2 rounded"
      >
        New Submission
      </Button>
      <ul>
        {submissions?.map((submission) => (
          <li
            key={submission.id}
            onClick={() => handleSelectSubmission(submission)}
            className={`cursor-pointer p-2 ${
              selectedSubmission?.id === submission.id ? "bg-blue-200" : ""
            }`}
          >
            Submission #{submission.id}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;