import React from 'react';

const TailwindTest: React.FC = () => {
  return (
    <div>
      <div className="test-class">
        CSS Test - If you see red background, CSS is working!
      </div>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h1 className="text-white text-xl font-bold">TailwindCSS Test</h1>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">If you can see this styled properly, TailwindCSS is working!</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Test Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;
