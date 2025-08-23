import React from 'react';

const StatsSectionSkeleton = () => (
  <div className="bg-white py-16 animate-pulse">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[1,2,3,4].map((_, i) => (
          <div key={i} className="flex flex-col items-center text-center p-4 rounded-lg">
            <div className="mb-4 p-3 bg-gray-200 rounded-full h-14 w-14" />
            <div className="h-8 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default StatsSectionSkeleton;
