import React from 'react';


const AnimatedError = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-24 animate-shake">
    <svg className="w-16 h-16 text-red-500 mb-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
    </svg>
    <p className="text-lg text-red-600 font-semibold animate-pulse mb-6">Whoops! Something went wrong</p>
    <button
      className="px-6 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition-colors font-semibold"
      onClick={() => window.location.reload()}
    >
      Refresh
    </button>
  </div>
);

export default AnimatedError;
