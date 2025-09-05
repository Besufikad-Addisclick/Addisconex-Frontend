/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, getSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LogOut, Check, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

// Define types
interface Package {
  id: string;
  name: string;
  price: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  max_users: number;
  support_level: string;
  has_free_trial: boolean;
  features: string[];
  subscription_plan: string;
}
interface SubscriptionPlan {
  id: string;
  name: string;
  duration_months: number;
  packages: Package[];
}
interface UserSubscription {
  id: string;
  payment_method: string;
  amount: string;
  start_date: string;
  end_date: string;
  screenshot: string;
  created_at: string;
  status: string;
}
interface SubscriptionPlanResponse {
  has_active_subscription: boolean;
  subscription_plans: SubscriptionPlan[];
  active_subscription: UserSubscription | null;
}

export default function ChoosePlanPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
  }, [session, router]);

  const handleLogout = async () => {
    await signOut({ 
      redirect: false,
      callbackUrl: '/auth/login'
    });
    window.location.href = '/auth/login';
  };

  useEffect(() => {
    async function fetchPlans() {
      try {
        if (!session?.accessToken) {
          setError('Please log in to continue');
          return;
        }

        setLoading(true);
        setError(null);
        const response = await fetch("/api/subscription-plans", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.accessToken}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401) {
            throw new Error(
              errorData.error || "Unauthorized: Invalid or missing access token"
            );
          }
          throw new Error(
            errorData.error ||
              `Failed to fetch subscription plans: ${response.status}`
          );
        }
        const data: SubscriptionPlanResponse = await response.json();
        console.log("Fetched subscription plans:", data.subscription_plans);
        setPlans(data.subscription_plans);
        // Redirect logic
        if (data.has_active_subscription) {
          router.push("/dashboard");
        } else if (
          data.active_subscription &&
          data.active_subscription.status === "pending"
        ) {
          router.push("/checkout");
        }
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load subscription plans");
        setLoading(false);
      }
    }
    
    if (session?.accessToken) {
      fetchPlans();
    }
  }, [router, session]);

  const handlePackageSelect = (planId: string, packageId: string) => {
    setSelectedPlanId(planId);
    setSelectedPackageId(packageId);
  };

  const handleCheckout = () => {
    if (selectedPlanId && selectedPackageId) {
      router.push(
        `/checkout?planId=${selectedPlanId}&packageId=${selectedPackageId}`
      );
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white shadow-sm gap-4">
        <div className="text-left">
          <div className="flex items-center transition-transform duration-300 hover:scale-105">
            <Image
              src="/acx.png"
              alt="AddisConX"
              width={200}
              height={30}
              className="filter brightness-100"
              priority
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center text-sm md:text-base"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
          {selectedPackageId && (
            <Button
              onClick={handleCheckout}
              className="bg-[#BF6818] hover:bg-[#a65c15] text-white text-sm md:text-base"
            >
              Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto p-6 bg-gradient-to-b from-gray-50 to-gray-100">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
            <div className="container mx-auto p-6 bg-gradient-to-b from-gray-50 to-gray-100">
              {/* Header Skeleton */}
              <div className="flex justify-between items-center p-4 bg-white shadow-sm mb-8">
                <div className="text-left">
                  <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                  <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>

              {/* Title Skeleton */}
              <div className="h-10 w-1/2 mx-auto bg-gray-200 rounded-md animate-pulse mb-12"></div>

              {/* Plan Cards Skeleton */}
              <div className="space-y-8">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="mb-8">
                    <div className="shadow-lg bg-white rounded-lg">
                      <div className="p-6 text-center">
                        <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse mx-auto mb-2"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse mx-auto"></div>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                          {[...Array(3)].map((_, j) => (
                            <div
                              key={j}
                              className="bg-white rounded-lg shadow-lg p-6 flex flex-col w-full"
                            >
                              <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse mb-4"></div>
                              <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse mb-4"></div>
                              <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mb-2"></div>
                              <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mb-2"></div>
                              <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse mb-6"></div>
                              <div className="space-y-3 flex-1">
                                {[...Array(3)].map((_, k) => (
                                  <div key={k} className="flex items-start">
                                    <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse mr-2 mt-1"></div>
                                    <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse"></div>
                                  </div>
                                ))}
                              </div>
                              <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse mt-6"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <Alert className="max-w-md mx-auto">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
        {!loading && !error && plans.length === 0 && (
          <div className="text-center text-yellow-600 bg-yellow-100 p-4 rounded-lg">
            No subscription plans available. Please contact support.
          </div>
        )}
        {!loading && !error && plans.length > 0 && (
          <>
            {plans.map((plan) => (
              <div key={plan.id} className="w-full">
                <div className="p-6 text-center">
                  <h2 className="text-2xl font-bold">{plan.name} Plan</h2>
                  {plan.name != "professionals" && (
                  <p className="text-gray-600">
                    Duration:{" "}
                    {plan.duration_months >= 12
                      ? `${plan.duration_months / 12} year${
                          plan.duration_months / 12 > 1 ? "s" : ""
                        }`
                      : `${plan.duration_months} month${
                          plan.duration_months > 1 ? "s" : ""
                        }`}
                  </p>
                  )}
                </div>

                <div className="mx-auto max-w-fit">
                  <div className="flex flex-wrap gap-8 justify-center">
                    {plan.packages
                      .filter((pkg) => pkg.is_active)
                      .map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`bg-white rounded-lg shadow-lg p-6 flex flex-col w-72 cursor-pointer transition-all duration-300 border-2 ${
                            selectedPackageId === pkg.id
                              ? "border-2 border-primary"
                              : pkg.support_level === "Premium"
                              ? "border-2 border-primary relative"
                              : "border border-gray-200"
                          }`}
                          onClick={() => handlePackageSelect(plan.id, pkg.id)}
                        >
                          {pkg.support_level === "Premium" && (
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
                            {plan.name != "professionals" && (
                            <span className="text-gray-500 text-sm ml-2">
                              /
                              {plan.duration_months >= 12
                                ? `${plan.duration_months / 12} year${
                                    plan.duration_months / 12 > 1 ? "s" : ""
                                  }`
                                : `${plan.duration_months} month${
                                    plan.duration_months > 1 ? "s" : ""
                                  }`}
                            </span>
                            )}
                          </div>
                          {pkg.has_free_trial && (
                            <p className="mt-2 text-sm text-green-600">
                              Includes free trial
                            </p>
                          )}
                          <p className="mt-4 text-gray-600">
                            {pkg.description}
                          </p>
                          <ul className="mt-6 space-y-3 flex-1">
                            {pkg.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <span className="flex-shrink-0">
                                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                                </span>
                                <span className="text-gray-600">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <Button
                            className={`mt-8 w-full ${
                              selectedPackageId === pkg.id
                                ? "bg-[#BF6818] hover:bg-[#a65c15]"
                                : "bg-gray-200"
                            }`}
                            variant={
                              pkg.support_level === "Premium"
                                ? "default"
                                : "outline"
                            }
                            disabled={selectedPackageId === pkg.id}
                          >
                            {selectedPackageId === pkg.id
                              ? "Selected"
                              : "Choose Plan"}
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {selectedPackageId && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={handleCheckout}
              className="bg-[#BF6818] hover:bg-[#a65c15] text-white shadow-lg rounded-full p-4"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
