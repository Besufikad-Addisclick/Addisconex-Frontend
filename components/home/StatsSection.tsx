import React, { memo } from 'react';
import { Users, Building2, LineChart, Clock } from 'lucide-react';

const StatsSection = memo(() => {
  const stats = [
    { 
      icon: <Building2 className="h-8 w-8 text-primary" />,
      value: "300+", 
      label: "Verified Suppliers" 
    },
    { 
      icon: <Users className="h-8 w-8 text-primary" />,
      value: "10,000+", 
      label: "Active Customers" 
    },
    { 
      icon: <LineChart className="h-8 w-8 text-primary" />,
      value: "50,000+", 
      label: "Material Price Points" 
    },
    { 
      icon: <Clock className="h-8 w-8 text-primary" />,
      value: "Weekly", 
      label: "Price Updates" 
    },
  ];

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4 rounded-lg transition-all duration-300 hover:shadow-md">
              <div className="mb-4 p-3 bg-primary/5 rounded-full">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

StatsSection.displayName = 'StatsSection';

export default StatsSection;