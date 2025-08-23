import React from 'react';

const TrustedClientsSkeleton = () => (
  <section className="py-16 bg-white animate-pulse">
    <div className="container mx-auto px-4">
      <div className="h-8 w-64 bg-gray-200 rounded mb-12 mx-auto" />
      <div className="flex overflow-hidden">
        <div className="flex space-x-12 w-full justify-center">
          {[1,2,3,4,5,6].map((_, i) => (
            <div key={i} className="flex items-center justify-center min-w-[200px]">
              <div className="h-16 w-32 bg-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TrustedClientsSkeleton;
