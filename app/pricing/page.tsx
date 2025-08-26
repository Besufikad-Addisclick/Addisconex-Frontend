"use client";

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { auth, SubscriptionPlan } from '@/lib/auth';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('suppliers');
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        const plans = await auth.getSubscriptionPlans();
        setSubscriptionPlans(plans);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionPlans();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto mt-10">
            <div className="text-center mb-12">
              <div className="h-10 w-1/3 bg-gray-200 rounded mx-auto animate-pulse mb-4" />
              <div className="h-5 w-2/3 bg-gray-200 rounded mx-auto animate-pulse" />
            </div>
            <div className="mt-6 flex justify-center">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`h-10 w-28 bg-gray-200 animate-pulse ${i === 0 ? 'rounded-l-lg' : ''} ${i === 2 ? 'rounded-r-lg' : ''}`} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg p-6 flex flex-col border border-gray-200 animate-pulse">
                  <div className="h-6 w-1/2 bg-gray-200 rounded mb-4" />
                  <div className="h-8 w-1/3 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-1/4 bg-gray-200 rounded mb-4" />
                  <div className="h-4 w-full bg-gray-200 rounded mb-4" />
                  <div className="flex-1 space-y-3 mt-6">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-4 w-3/4 bg-gray-200 rounded" />
                    ))}
                  </div>
                  <div className="h-10 w-full bg-gray-200 rounded mt-8" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }
  if (error) return <div>Error: {error}</div>;

  const selectedPlanData = subscriptionPlans.find(plan => plan.name === selectedPlan);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mt-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Pricing Plans
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your construction business. From individual contractors to large enterprises, we have you covered.
            </p>
          </div>

          <div className="mt-6 flex justify-center">
  <div
    className="inline-flex rounded-md shadow-sm w-full max-w-full sm:max-w-3xl overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50 sm:overflow-x-visible px-4 sm:px-0"
    role="group"
  >
    {subscriptionPlans.map((plan, index) => (
      <button
        key={plan.id}
        type="button"
        className={cn(
          "px-4 py-2 text-sm font-medium border transition-colors duration-200 whitespace-nowrap",
          selectedPlan === plan.name
            ? "bg-primary text-white border-primary"
            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
          index === 0 ? "rounded-l-lg" : "",
          index === subscriptionPlans.length - 1 ? "rounded-r-lg" : "",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
        onClick={() => setSelectedPlan(plan.name)}
        aria-pressed={selectedPlan === plan.name}
      >
        {plan.name}
      </button>
    ))}
  </div>
</div>

          <div className="w-full mt-8">
            <div className="mx-auto max-w-fit">
              <div className="flex flex-wrap gap-8 justify-center">
                {selectedPlanData?.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={cn(
                      'bg-white rounded-lg shadow-lg p-6 flex flex-col w-72',
                      pkg.support_level === 'Premium' ? 'border-2 border-primary relative' : 'border border-gray-200'
                    )}
                  >
                    {pkg.support_level == 'Premium' && (
                      <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-sm font-medium px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-gray-800">{pkg.name}</h3>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-800">
                        {pkg.price} ETB
                      </span>
                      {selectedPlan != "professionals" && (
                      <span className="text-gray-500 text-sm ml-2">
                        /{selectedPlanData.duration_months >= 12
                            ? `${selectedPlanData.duration_months / 12} year${
                                selectedPlanData.duration_months / 12 > 1
                                  ? "s"
                                  : ""
                              }`
                            : `${selectedPlanData.duration_months} month${
                                selectedPlanData.duration_months > 1 ? "s" : ""
                              }`}
                      </span>
                      )}
                    </div>
                    <p className="mt-4 text-gray-600">{pkg.description}</p>
                    <ul className="mt-6 space-y-3 flex-1">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0"><Check className="h-5 w-5 text-success mr-2 mt-1" /></span>
                            <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-8 w-full"
                      variant={pkg.support_level === 'Premium' ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href="/auth/signup">
                        Get Started
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
