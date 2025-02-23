import CodeSubmission from './components/CodeSubmission';
import Sidebar from './components/Sidebar';

export default function Home() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <CodeSubmission />
      </main>
    </div>
  );
}
