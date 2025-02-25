"use client";

import { Language } from "../utils/enums";
import React, { useState, useEffect, useRef } from "react";
import { trpc } from "@/app/utils/trpc";
import { Submission } from '@prisma/client';
// syntax highlighting
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";

const CodeSubmission = ({ resetForm }: { resetForm: number }) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("javascript");
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null >(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [codeKey, setCodeKey] = useState(0);

  const createMutation = trpc.submissions.create.useMutation({
    onSuccess: (newSubmission) => {
      const submissionWithDate: Submission = {
        ...newSubmission,
        createdAt: new Date(newSubmission.createdAt),
      };
      setCurrentSubmission(submissionWithDate);
      setFeedback(newSubmission.feedback);
    },
  });

  /// /// /// /// /// /// /// AI Streaming
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const feedbackMutation = trpc.ai.generateFeedback.useMutation({
    onSuccess: async (stream) => {
      setFeedback(''); // Reset feedback
      for await (const chunk of stream) {
        setFeedback((prev) => prev + chunk); // Append each chunk
      }
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error:', error);
      setIsLoading(false);
    },
  });

  const handleCreateSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ code, language });
  };

  const handleGenerateFeedback = () => {
    if (currentSubmission) {
      setIsLoading(true);
      feedbackMutation.mutate({ submissionId: currentSubmission.id });
    }
  };
  /// /// /// /// /// /// ///

  useEffect(() => {
    if (language === "javascript") {
      Prism.highlightAll();
    } else {
      setCodeKey((prev) => prev + 1);
    }
  }, [code, language]);

  // reset form when triggered by Sidebar
  useEffect(() => {
    if (resetForm) {
      setCurrentSubmission(null);
      setCode('');
      setLanguage('javascript');
      setFeedback('');
    }
  }, [resetForm]);

  // const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  //   if (e.key === "Tab") {
  //     e.preventDefault();
  //     const start = e.currentTarget.selectionStart;

  //     const end = e.currentTarget.selectionEnd;
  //     const newCode = code.substring(0, start) + "  " + code.substring(end);
  //     setCode(newCode);

  //     // Restore cursor position safely using a ref
  //     setTimeout(() => {
  //       if (textareaRef.current) {
  //         textareaRef.current.selectionStart =
  //           textareaRef.current.selectionEnd = start + 2;
  //       }
  //     }, 0);
  //   }
  // };

  return (
    <div className="p-4">
      {!currentSubmission ? (
        <form onSubmit={handleCreateSubmission} className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">New Code Submission</h2>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="mt-1 block w-full p-2 border rounded"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Code
            </label>
            <textarea
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code here"
              rows={10}
              className="mt-1 block w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Submission</h2>
          <div>
            <p className="text-sm font-medium text-gray-700">Language:</p>
            <p className="text-gray-900">{currentSubmission.language}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Code:</p>
            <pre className="p-2 bg-gray-100 border rounded text-gray-800 whitespace-pre-wrap">
              {currentSubmission.code}
            </pre>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Feedback:</p>
            {isLoading ? (
              <p className="text-gray-500">Generating... {feedback}</p>
            ) : feedback ? (
              <p className="text-gray-800">{feedback}</p>
            ) : (
              <button
                onClick={handleGenerateFeedback}
                className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
                disabled={isLoading}
              >
                Generate Feedback
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeSubmission;
