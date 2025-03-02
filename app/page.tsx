"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import CodeSubmission from "./components/CodeSubmission";
import { Button } from "@/app/components/ui/button";

export default function Home() {
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  const [refetchSubmissions, setRefetchSubmissions] = useState<() => void>(() => () => {});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [resetCode, setResetCode] = useState(false);

  const handleNewSubmission = (submissionId: string | null, reset?: boolean) => {
    setCurrentSubmissionId(submissionId);
    // clear code field if we try to make new submission while being on the old one
    if (reset) {
      setResetCode(true);
      setTimeout(() => setResetCode(false), 0);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <Button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        variant="outline"
        className="md:hidden fixed bottom-4 right-4 z-10 p-2 bg-gray-800 text-gray-200 border-gray-600 rounded-full shadow-lg hover:bg-gray-700"
      >
        Submissions
      </Button>
      <Sidebar
        onNewSubmission={handleNewSubmission}
        setRefetchSubmissions={setRefetchSubmissions}
        className={`fixed h-screen w-64 bg-gray-800 z-20 transform transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
      />
      <div className="flex-1 p-4">
        <CodeSubmission
          submissionId={currentSubmissionId}
          refetchSubmissions={refetchSubmissions}
          resetCode={resetCode}
        />
      </div>
    </div>
  );
}