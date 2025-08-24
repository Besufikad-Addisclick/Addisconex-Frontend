"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";

// Define interfaces
export interface Package {
  id: string;
  name: string;
  price: string;
  description: string;
  is_active: boolean;
  max_users: number;
  order?: number;
  support_level: string;
  has_free_trial: boolean;
  features: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration_months: number;
  packages: Package[];
}

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("suppliers");
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        const plans = await auth.getSubscriptionPlans();
        console.log("Fetched subscription plans:", plans);
        setSubscriptionPlans(plans);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load subscription plans";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionPlans();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const selectedPlanData = subscriptionPlans.find(
    (plan) => plan.name === selectedPlan
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {" "}
      {/* Margin-top via pt-16 */}
      {/* Header */}
      <Header />
      {/* Main content */}
      <main className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-9xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Pricing Plans
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your construction business. From
              individual contractors to large enterprises, we have you covered.
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
                    index === subscriptionPlans.length - 1
                      ? "rounded-r-lg"
                      : "",
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
                {selectedPlanData?.packages
                  .filter((pkg) => pkg.is_active)
                  .map((pkg) => (
                    <div
                      key={pkg.id}
                      className={cn(
                        "bg-white rounded-lg shadow-lg p-6 flex flex-col w-72",
                        pkg.support_level === "Premium"
                          ? "border-2 border-primary relative"
                          : "border border-gray-200"
                      )}
                    >
                      {pkg.support_level === "Popular" && (
                        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-sm font-medium px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-gray-800">
                        {pkg.name}
                      </h3>
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-gray-800">
                          {pkg.price} ETB
                        </span>
                        {selectedPlan != "professionals" && (
                        <span className="text-gray-500 text-sm ml-2">
                          /
                          {selectedPlanData.duration_months >= 12
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
                      {pkg.has_free_trial && (
                        <p className="mt-2 text-sm text-green-600">
                          Includes free trial
                        </p>
                      )}
                      <p className="mt-4 text-gray-600">{pkg.description}</p>
                      <ul className="mt-6 space-y-3 flex-1">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0">
                              <Check className="h-5 w-5 text-success mr-2 mt-1" />
                            </span>
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="mt-8 w-full"
                        variant={
                          pkg.support_level === "Premium"
                            ? "default"
                            : "outline"
                        }
                        asChild
                      >
                        <Link href="/auth/signup">Get Started</Link>
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
