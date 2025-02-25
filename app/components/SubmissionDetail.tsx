'use client';

import React, { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import { Submission } from '@prisma/client';

interface SubmissionDetailProps {
  submission: Submission;
  onClose: () => void;
}

const SubmissionDetail = ({ submission, onClose }: SubmissionDetailProps) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle click outside and escape key press
  useEffect(() => {
    if (isMounted) {
      Prism.highlightAll();

      // Close modal on Escape key press
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      // Close modal if clicking outside the modal content
      const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          onClose();
        }
      };

      // Add event listeners
      window.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);

      // Cleanup event listeners
      return () => {
        window.removeEventListener('keydown', handleEscape);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMounted, onClose]);

  if (!isMounted) return null;

  const handleCopyClick = () => {
    navigator.clipboard.writeText(submission.code).then(
      () => setCopySuccess(true),
      () => setCopySuccess(false)
    );
  };

  if (!isMounted) {
    return null; // Prevent SSR mismatch by not rendering until mounted
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      ref={backdropRef}
    >
      <div
        className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        ref={modalRef}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-200">Submission Detail</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400">
            {submission.createdAt.toLocaleString()}
          </p>
          <p className="text-sm font-semibold text-gray-200">{submission.language}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-gray-200">Code</h3>
          <div className="relative">
            <pre className="rounded bg-gray-900 p-4">
              <code className={`language-${submission.language}`}>
                {submission.code}
              </code>
            </pre>
            <button
              onClick={handleCopyClick}
              className="absolute top-2 right-2 bg-gray-600 text-white py-1 px-2 rounded hover:bg-gray-500"
            >
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2 text-gray-200">AI Feedback</h3>
          <div className="bg-gray-900 rounded p-4 text-gray-300">
            {submission.feedback}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail;
