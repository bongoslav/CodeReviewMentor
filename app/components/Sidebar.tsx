'use client';

import React, { useState, useEffect } from 'react';
import SubmissionDetail from './SubmissionDetail';

const Sidebar = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    // Load submissions from localStorage (will be replaced with DB calls later)
    const loadSubmissions = () => {
      const stored = JSON.parse(localStorage.getItem('submissions') || '[]');
      setSubmissions(stored);
    };

    loadSubmissions();
    // Listen for storage changes from other components
    window.addEventListener('storage', loadSubmissions);
    // Listen for our custom event
    window.addEventListener('submissionsUpdated', loadSubmissions);
    
    return () => {
      window.removeEventListener('storage', loadSubmissions);
      window.removeEventListener('submissionsUpdated', loadSubmissions);
    };
  }, []);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      <div className="w-64 h-screen bg-gray-800 p-4 border-r border-gray-700 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Submission History</h2>
        <div className="space-y-2">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="p-3 bg-gray-700 rounded shadow hover:bg-gray-600 cursor-pointer transition-colors"
              onClick={() => setSelectedSubmission(submission)}
            >
              <p className="text-sm font-medium text-gray-200">{submission.language}</p>
              <pre className="text-xs text-gray-300 mt-1 overflow-hidden">
                {truncateText(submission.code, 50)}
              </pre>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(submission.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {selectedSubmission && (
        <SubmissionDetail
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </>
  );
};

export default Sidebar; 