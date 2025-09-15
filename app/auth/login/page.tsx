// app/auth/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signIn, getSession } from "next-auth/react";
import { useAuth } from "@/app/context/AuthContext";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Schema for client-side validation
const schema = z
  .object({
    email: z
      .string()
      .email("Enter a valid email address")
      .optional()
      .or(z.literal("")),
    phone_number: z
      .string()
      .regex(/^\+2519\d{8}$/, "Enter a valid Ethiopian phone number like +251912345678")
      .optional()
      .or(z.literal("")),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
  })
  .refine(
    (data) => {
      return (
        (data.email && data.email.length > 0) ||
        (data.phone_number && data.phone_number.length > 0)
      );
    },
    {
      message: "Either email or phone number is required",
      path: ["email"], // or path: ['phone_number'] if you want at phone_number
    }
  );

type FormData = z.infer<typeof schema>;

interface LoginErrors {
  email?: string[];
  phone_number?: string[];
  password?: string[];
  non_field_errors?: string[];
}

// Helper function to get role-based redirect URL
function getRoleBasedRedirectUrl(userType: string, fallbackUrl: string): string {
  console.log("getRoleBasedRedirectUrl - userType:", userType, "fallbackUrl:", fallbackUrl);
  
  // Extract path from full URL if needed
  let path = fallbackUrl;
  try {
    if (fallbackUrl.startsWith('http')) {
      const url = new URL(fallbackUrl);
      path = url.pathname;
      console.log("getRoleBasedRedirectUrl - extracted path from URL:", path);
    }
  } catch (e) {
    // If URL parsing fails, use the original fallbackUrl
    path = fallbackUrl;
  }
  
  // If there's a specific callback URL that's not the default dashboard, honor it
  if (path && path !== '/dashboard' && path !== '/') {
    console.log("getRoleBasedRedirectUrl - using specific callback URL:", path);
    return path;
  }
  
  // Role-based redirects with special default fallbacks
  // Only agencies and professionals get their specific dashboards
  if (userType === 'agencies') {
    console.log("getRoleBasedRedirectUrl - redirecting agencies to /dashboard/agencies");
    return '/dashboard/agencies';
  } else if (userType === 'professionals') {
    console.log("getRoleBasedRedirectUrl - redirecting professionals to /dashboard/professionals");
    return '/dashboard/professionals';
  } else {
    // All other user types (contractors, suppliers, subcontractors, consultants, admin, individuals, etc.)
    // should only access the main dashboard
    console.log("getRoleBasedRedirectUrl - redirecting default to /dashboard for userType:", userType);
    return '/dashboard';
  }
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const desiredCallbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { toast } = useToast();
  const [serverErrors, setServerErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors: formErrors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      phone_number: "",
      password: "",
      rememberMe: false,
    },
  });

  // Check authentication status on mount and handle errors from URL
  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getSession();
        console.log("[login] Initial auth check - session:", session);
        if (session) {
          console.log("[login] Initial auth check - userType:", session.user.userType);
          console.log("[login] Initial auth check - desiredCallbackUrl:", desiredCallbackUrl);
          // Get role-based redirect URL
          const redirectUrl = getRoleBasedRedirectUrl(session.user.userType, desiredCallbackUrl);
          console.log("[login] User authenticated, redirecting to", redirectUrl);
          router.replace(redirectUrl);
        }
      } catch (error) {
        console.error("[login] Auth check error:", error);
      }
    }
    
    // Check for error in URL params
    const urlError = searchParams.get('error');
    if (urlError) {
      console.log("[login] URL error:", urlError);
      setServerErrors({
        non_field_errors: [decodeURIComponent(urlError)]
      });
      toast({
        title: "Login Error",
        description: decodeURIComponent(urlError),
        variant: "destructive",
      });
    }
    
    checkAuth();
  }, [router, desiredCallbackUrl, searchParams, toast]);

  const onSubmit = async (data: any) => {
    setServerErrors({});
    try {
      console.log("Form submitted with data:", data);
      setIsLoading(true);
      
      const result = await signIn('credentials', {
        email: data.email,
        phone_number: data.phone_number,
        password: data.password,
        redirect: false, // Handle redirect manually to show errors
        callbackUrl: desiredCallbackUrl, // Pass the callback URL
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        console.log("SignIn error:", result.error);
        setServerErrors({
          non_field_errors: [result.error]
        });
        toast({
          title: "Login Error",
          description: result.error,
          variant: "destructive",
        });
      } else if (result?.ok) {
        // Get the session to determine user type for redirect
        // Add a delay and retry to ensure session is available
        let session = null;
        let attempts = 0;
        const maxAttempts = 10; // Increased attempts
        
        while (!session && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 300)); // Increased delay
          session = await getSession();
          attempts++;
          console.log(`Login successful - attempt ${attempts}, session:`, session);
          
          // If we have a session with user data, break early
          if (session?.user?.userType) {
            console.log("Session with userType found, breaking early");
            break;
          }
        }
        
        console.log("Login successful - final session:", session);
        console.log("Login successful - userType:", session?.user?.userType);
        console.log("Login successful - desiredCallbackUrl:", desiredCallbackUrl);
        
        const redirectUrl = session?.user?.userType 
          ? getRoleBasedRedirectUrl(session.user.userType, desiredCallbackUrl)
          : desiredCallbackUrl;
        
        console.log("Login successful, redirecting to:", redirectUrl);
        toast({
          title: "Success!",
          description: "You have been logged in successfully.",
        });
        
        // Use replace instead of push to avoid back button issues
        // Add a small delay to ensure session is fully established
        setTimeout(() => {
          console.log("Attempting redirect to:", redirectUrl);
          router.replace(redirectUrl);
          
          // Fallback: if redirect doesn't work, try window.location
          setTimeout(() => {
            if (window.location.pathname === '/auth/login') {
              console.log("Router redirect failed, using window.location");
              window.location.href = redirectUrl;
            }
          }, 1000);
        }, 100);
      }
    } catch (err: any) {
      console.log("Caught error:", err);
      const errorMessage = err.message || "Login failed. Please try again.";
      setServerErrors({
        non_field_errors: [errorMessage],
      });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log("Login process completed, isLoading set to:", false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-100 via-purple-100 to-pink-100 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-400 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-400 rounded-full opacity-20 translate-x-1/2 translate-y-1/2" />
      </div>

      <Header />

      <main className="flex items-center justify-center min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-extrabold text-gray-900">
                Welcome Back
              </CardTitle>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to continue your construction journey
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-6 space-x-4 border-b border-gray-300">
                <button
                  type="button"
                  className={`pb-2 px-4 text-sm font-medium ${
                    loginMethod === "email"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => {
                    setLoginMethod("email");
                    setPhoneNumber("");
                    setValue("phone_number", "");
                  }}
                >
                  Email
                </button>
                <button
                  type="button"
                  className={`pb-2 px-4 text-sm font-medium ${
                    loginMethod === "phone"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => {
                    setLoginMethod("phone");
                    setValue("email", "");
                  }}
                >
                  Phone Number
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {serverErrors.non_field_errors && (
                  <div className="text-red-600 text-sm text-center">
                    {serverErrors.non_field_errors.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                )}
                <div className="space-y-4">
                  {loginMethod === "email" && (
                    <div>
                      <label htmlFor="email" className="sr-only">
                        Email address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email address"
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                        {...register("email")}
                      />
                      {(formErrors.email || serverErrors.email) && (
                        <div className="text-red-600 text-sm mt-1">
                          <p>
                            {formErrors.email?.message ||
                              serverErrors.email?.[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {loginMethod === "phone" && (
                    <div className="space-y-4">
                      <PhoneInput
                        country="et"
                        value={phoneNumber}
                        onChange={(value) => {
                          setPhoneNumber(value);
                          setValue("phone_number", value ? `+${value}` : "");
                        }}
                       
                        countryCodeEditable={false}
                        inputStyle={{
                          background: "white",
                          width: "100%",
                          height: 40,
                        }}
                      />
                      {(formErrors.phone_number ||
                        serverErrors.phone_number) && (
                        <div className="text-red-600 text-sm mt-1">
                          <p>
                            {formErrors.phone_number?.message ||
                              serverErrors.phone_number?.[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="relative">
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {(formErrors.password || serverErrors.password) && (
                      <div className="text-red-600 text-sm mt-1">
                        <p>
                          {formErrors.password?.message ||
                            serverErrors.password?.[0]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Remember Me and Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="rememberMe"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="remember-me"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-sm text-gray-600"
                    >
                      Remember Me
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-900 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  variant="orange"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      href="/auth/signup"
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                  <p className="text-sm text-gray-600">
                    <Link
                      href="/auth/forgot-password"
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
