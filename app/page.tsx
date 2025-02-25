'use client';

import { useState } from 'react';
import CodeSubmission from './components/CodeSubmission';
import Sidebar from './components/Sidebar';

export default function Home() {
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleNewSubmission = () => {
    setResetTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex">
      <Sidebar onNewSubmission={handleNewSubmission} />
      <main className="flex-1">
        <CodeSubmission resetForm={resetTrigger} />
      </main>
    </div>
  );
}
