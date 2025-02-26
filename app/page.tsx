"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import CodeSubmission from "./components/CodeSubmission";

export default function Home() {
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  const [refetchSubmissions, setRefetchSubmissions] = useState<() => void>(() => () => {});

  const handleNewSubmission = (submissionId: string | null) => {
    setCurrentSubmissionId(submissionId);
  };

  return (
    <div className="flex">
      <Sidebar
        onNewSubmission={handleNewSubmission}
        setRefetchSubmissions={setRefetchSubmissions} // Pass setter to Sidebar
      />
      <div className="flex-1">
        <CodeSubmission
          submissionId={currentSubmissionId}
          refetchSubmissions={refetchSubmissions} // Pass refetch function to CodeSubmission
        />
      </div>
    </div>
  );
}