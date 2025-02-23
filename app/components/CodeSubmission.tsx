'use client';

import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-csharp';

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
];

const CodeSubmission = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [feedback, setFeedback] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [codeKey, setCodeKey] = useState(0);

  const handleSubmit = async () => {
    // TODO: Implement submission logic
    setFeedback('Processing your code...');
    const submission = {
        id: Date.now(),
        code,
        language,
        feedback: 'Sample feedback for this submission',
        timestamp: new Date().toISOString(),
    };
      
    // In the future, this will be a database call
    const existingSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    localStorage.setItem('submissions', JSON.stringify([submission, ...existingSubmissions]));
    
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('submissionsUpdated'));
  };

  useEffect(() => {
    if (language === 'javascript') {
      Prism.highlightAll();
    } else {
      setCodeKey(prev => prev + 1);
    }
  }, [code, language]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);

      // Restore cursor position safely using a ref
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="p-6 space-y-4 bg-gray-900">
      <div className="flex items-center gap-4 mb-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border rounded p-2 bg-gray-800 text-gray-200 border-gray-700 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </div>

      {/* Code Input Field */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full p-4 font-mono text-sm text-transparent bg-transparent caret-white resize-none overflow-hidden"
          spellCheck="false"
          style={{
            fontFamily: "monospace",
            fontSize: "0.875rem",
            lineHeight: "1.5",
            letterSpacing: "normal",
          }}
        />
        <pre
          className="w-full h-64 p-4 font-mono text-sm border rounded overflow-auto bg-gray-800 border-gray-700 whitespace-pre"
          style={{
            fontFamily: "monospace",
            fontSize: "0.875rem",
            lineHeight: "1.5",
            letterSpacing: "normal",
          }}
        >
          <code 
            key={codeKey}
            className={language === "javascript" ? "language-javascript" : ""}
          >
            {code || `Enter your ${language} code here...`}
          </code>
        </pre>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-200">AI Feedback</h3>
        <div className="border rounded p-4 min-h-32 bg-gray-800 border-gray-700 text-gray-300">
          {feedback || "AI feedback will appear here..."}
        </div>
      </div>
    </div>
  );
};

export default CodeSubmission; 
