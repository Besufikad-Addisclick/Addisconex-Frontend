import React from 'react';

const BannerSkeleton = () => (
  <div className="relative overflow-hidden h-screen bg-gray-100 animate-pulse flex items-center justify-center">
    <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 px-8">
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <div className="h-6 w-40 bg-gray-300 rounded mb-2" />
        <div className="h-12 w-3/4 bg-gray-300 rounded mb-2" />
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
        <div className="flex gap-4 mt-4">
          <div className="h-10 w-32 bg-gray-300 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="h-64 w-full bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);

export default BannerSkeleton;
