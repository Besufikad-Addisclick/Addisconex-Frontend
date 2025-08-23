/* eslint-disable @next/next/no-img-element */
"use client";
import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut, getSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Banknote,
  Phone,
  LogOut,
  ArrowLeft,
  PhoneCall,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

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
  package: string;
  amount: string;
  name: string;
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

function CheckoutContent() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSubscription, setActiveSubscription] =
    useState<UserSubscription | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null
  );
  const [selectedPackageName, setSelectedPackageName] = useState<string | null>(
    null
  );
  const [selectedPackagePrice, setSelectedPackagePrice] = useState<
    string | null
  >(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const paymentInfoRef = useRef<HTMLDivElement>(null);
  const successInfoRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
  }, [session, router]);

  const paymentInfo = {
    bankAccounts: [
      {
        bankName: "CBE",
        accountNumber: "1000-344-483-654",
        holder: "AddisConX",
        icon: <Banknote className="h-5 w-5 mr-2" />,
      },
      {
        bankName: "AWASH",
        accountNumber: "9876-5432-1098-7654",
        holder: "AddisConX",
        icon: <Banknote className="h-5 w-5 mr-2" />,
      },
    ],
    hotline: "+251-912-345-6789",
    phoneNumber: "+251-115-999-8888",
    telegram: "@Addisconx",
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
          console.log(errorData.error);
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
        console.log("[subscription-plans] Response:", data);
        setPlans(data.subscription_plans);
        setActiveSubscription(data.active_subscription);
        // Redirect logic
        if (data.has_active_subscription) {
          router.push("/dashboard");
        }
        // if (data.active_subscription == null) {
        //   router.push("/choose-plan");
        // }
        // Set selected plan and package from query params
        const planId = searchParams.get("planId");
        const packageId = searchParams.get("packageId");
        if (planId && packageId) {
          const selectedPlan = data.subscription_plans.find(
            (plan) => plan.id === planId
          );
          const selectedPackage = selectedPlan?.packages.find(
            (pkg) => pkg.id === packageId
          );
          if (selectedPackage) {
            setSelectedPackageId(packageId);
            setSelectedPackageName(selectedPackage.name);
            setSelectedPackagePrice(selectedPackage.price);
            if (paymentInfoRef.current) {
              paymentInfoRef.current.scrollIntoView({ behavior: "smooth" });
            }
          }
        } else if (
          data.active_subscription &&
          data.active_subscription.package
        ) {
          setSelectedPackageId(data.active_subscription.package);
          setSelectedPackageName(data.active_subscription.name);
          setSelectedPackagePrice(data.active_subscription.amount);
          if (paymentInfoRef.current) {
            paymentInfoRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }
        setLoading(false);
      } catch (err: any) {
        console.log(err);
        setError(err.message || "Failed to load subscription plans");
        setLoading(false);
      }
    }
    
    if (session?.accessToken) {
      fetchPlans();
    }
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [router, session, searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackageId || !file) {
      setError("Please select a package and upload an invoice screenshot");
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("package_id", selectedPackageId);
      formData.append("screenshot", file);
      const response = await fetch("/api/upload-invoice", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.accessToken}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error(
            errorData.error || "Unauthorized: Invalid or missing access token"
          );
        }
        throw new Error(errorData.error || "Failed to upload invoice");
      }
      const data = await response.json();
      setSuccess(data.message || "Invoice uploaded successfully");
      toast({
        title: "Success!",
        description: "Invoice uploaded successfully.",
      });
      if (successInfoRef.current) {
        successInfoRef.current.scrollIntoView({ behavior: "smooth" });
      }
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to upload invoice");
    }
  };

  const handleAkiPay = async () => {
    if (!selectedPackageId) {
      setError("Please select a package to proceed with AkiPay");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const response = await fetch(
        `/api/initiate-subscription/${selectedPackageId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.accessToken}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error(
            errorData.error || "Unauthorized: Invalid or missing access token"
          );
        }
        throw new Error(errorData.error || "Failed to initiate AkiPay payment");
      }
      const data = await response.json();
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error("Payment URL not found in response");
      }
    } catch (err: any) {
      setError(err.message || "Failed to initiate AkiPay payment");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPlan = () => {
    router.push("/choose-plan");
  };

  const handleLogout = () => {
    console.log("Logging out user...");
    signOut({ redirect: false });
    router.push("/");
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white shadow-sm gap-3">
        <div className="text-left">
          <div className="flex items-center transition-transform duration-300 hover:scale-105">
            <Image
              src="/acx.png"
              alt="AddisPrice"
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
            onClick={handleBackToPlan}
            className="flex items-center text-sm md:text-base w-full md:w-auto justify-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plan
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center text-sm md:text-base w-full md:w-auto justify-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      <div className="container mx-auto p-6 bg-gradient-to-b from-gray-50 to-gray-100">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
          Complete Your Payment
        </h1>
        {selectedPackageName && selectedPackagePrice && (
          <div className="bg-gray-100 p-4 rounded-lg mb-4 text-center justify-center">
            <h4 className="text-lg font-semibold text-gray-800">
              Selected Package: {selectedPackageName}
            </h4>
            <p className="text-gray-600">
              Price: {Number(selectedPackagePrice).toFixed(2)} ETB
            </p>
          </div>
        )}
        {loading && (
          <div className="container mx-auto p-6 bg-gradient-to-b from-gray-50 to-gray-100 animate-pulse">
            <div className="bg-gray-200 rounded-lg p-6 mb-6 mx-auto max-w-md">
              <div className="h-6 bg-gray-300 rounded mb-2 w-2/3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-gray-200 rounded-lg p-6 h-64"></div>
              <div className="bg-gray-200 rounded-lg p-6 h-64"></div>
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
        {success && (
          <div
            className="flex items-center justify-center text-green-600 bg-green-100 p-4 rounded-lg mb-6"
            ref={successInfoRef}
          >
            <CheckCircle className="h-6 w-6 mr-2" />
            {success}
          </div>
        )}
        {!loading && !error && selectedPackageId && (
          <div className="grid grid-cols-1 gap-8" ref={paymentInfoRef}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg bg-white w-full">
                <CardHeader className="bg-[#C18461] hover:bg-[#C18461] text-white">
                  <CardTitle className="text-2xl font-bold">
                    Online Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {selectedPackageName && selectedPackagePrice && (
                    <div className="py-1">
                      <h4 className="text-lg font-semibold text-gray-800">
                        Pay via
                      </h4>
                    </div>
                  )}
                  <div>
                    <Button
                      onClick={handleAkiPay}
                      disabled={!!(activeSubscription && activeSubscription.screenshot != null)}
                      className="bg-[#a65c15] hover:bg-[#a65c15] text-white font-semibold py-3 rounded-lg transition-colors mb-6 flex items-center justify-center"
                      style={{ width: "100px", height: "70px" }}
                    >
                      <Image
                        src="/santim.png"
                        alt="Santim Pay"
                        width={100}
                        height={70}
                        className="w-full h-full object-contain"
                        priority
                      />
                    </Button>
                  </div>
                  <div className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      Contact Support
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 flex items-center">
                      <PhoneCall className="h-5 w-5 mr-2" />{" "}
                      {paymentInfo.hotline}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 flex items-center">
                      <PhoneCall className="h-5 w-5 mr-2" />{" "}
                      {paymentInfo.phoneNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      Telegram:{" "}
                      <a
                        href={`https://t.me/${paymentInfo.telegram.replace(
                          "@",
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {paymentInfo.telegram}
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
              {activeSubscription &&
              activeSubscription.status === "pending" &&
              activeSubscription.screenshot != null ? (
                <Card className="shadow-lg bg-white w-full">
                  <CardHeader className="bg-[#C18461] hover:bg-[#C18461] text-white">
                    <CardTitle className="text-2xl font-bold">
                      Payment Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Alert className="max-w-md mx-auto bg-yellow-100 text-yellow-600">
                        <AlertCircle className="h-6 w-6 mr-2" />
                        <AlertDescription>
                          Your payment is pending approval. We will notify you
                          once your payment has been approved. Please contact
                          support if you have any questions.
                        </AlertDescription>
                      </Alert>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          Package: {selectedPackageName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Amount: {activeSubscription.amount} ETB
                        </p>
                        <p className="text-sm text-gray-600">
                          Payment Method: {activeSubscription.payment_method}
                        </p>
                        <p className="text-sm text-gray-600">
                          Start Date:{" "}
                          {new Date(
                            activeSubscription.start_date
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          End Date:{" "}
                          {new Date(
                            activeSubscription.end_date
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-lg bg-white w-full">
                  <CardHeader className="bg-[#C18461] hover:bg-[#C18461] text-white">
                    <CardTitle className="text-2xl font-bold">
                      Bank transfer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Banknote className="h-5 w-5 mr-2" />
                        Bank Accounts
                      </h3>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-100 p-4 rounded-lg mb-4">
                        {paymentInfo.bankAccounts.map((account, index) => (
                          <div
                            key={index}
                            className="flex items-start border-l-4 border-[#BF6818] pl-4"
                          >
                            {account.icon}
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {account.bankName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Account: {account.accountNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                Holder: {account.holder}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label
                          htmlFor="invoice"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Invoice Screenshot
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            id="invoice"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="invoice"
                            className="cursor-pointer flex flex-col items-center justify-center"
                          >
                            {filePreview ? (
                              <img
                                src={filePreview}
                                alt="Invoice Preview"
                                className="max-h-48 rounded-lg mb-2 object-contain"
                              />
                            ) : (
                              <>
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-gray-500">
                                  Drag and drop or click to upload an image
                                </p>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                      {file && (
                        <div className="text-sm text-gray-600">
                          Selected file: {file.name} (
                          {(file.size / 1024).toFixed(2)} KB)
                        </div>
                      )}
                      <Button
                        type="submit"
                        disabled={!selectedPackageId || !file}
                        className="w-full bg-[#C18461] hover:bg-[#C18461] text-white font-semibold py-3 rounded-lg transition-colors"
                      >
                        <Upload className="mr-2 h-5 w-5" /> Submit Invoice
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
