import { useState, useEffect } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    try {
      setStatus('Component mounted successfully');
      console.log('Test page rendered successfully');
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Test page error:', error);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Test Page</h1>
        <p className="text-gray-700 mb-4">This is a simple test page to verify React rendering.</p>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="font-mono text-sm">Status: {status}</p>
        </div>
        <div className="mt-8">
          <button 
            onClick={() => alert('Button clicked!')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}