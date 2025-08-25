// app/auth/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      .min(12, "Enter a valid phone number")
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

export default function LoginPage() {
  const router = useRouter();
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

  // Check authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getSession();
        if (session) {
          console.log("[login] User authenticated, redirecting to /dashboard");
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error("[login] Auth check error:", error);
      }
    }
    checkAuth();
  }, [router]);

  const onSubmit = async (data: any) => {
    setServerErrors({});
    try {
      console.log("Form submitted with data:", data);
      setIsLoading(true);
      
      const result = await signIn('credentials', {
        email: data.email,
        phone_number: data.phone_number,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      console.log("Login successful");
      toast({
        title: "Success!",
        description: "You have been logged in successfully.",
      });
      
      // Wait for session to be established, then redirect
      let attempts = 0;
      const maxAttempts = 10;
      
      const checkSession = async () => {
        const session = await getSession();
        if (session && attempts < maxAttempts) {
          window.location.href = "/dashboard"; // Hard redirect to trigger middleware
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkSession, 200);
        } else {
          // Fallback if session doesn't establish
          window.location.href = "/dashboard";
        }
      };
      
      checkSession();
    } catch (err: any) {
      console.error("Caught error:", err);
      if (
        err &&
        typeof err === "object" &&
        (err.email || err.password || err.non_field_errors)
      ) {
        setServerErrors(err);
      } else {
        setServerErrors({
          non_field_errors: [err.message || "Login failed. Please try again."],
        });
      }
      toast({
        title: "Error",
        description: err.message || "Invalid email or password",
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
                  onClick={() => setLoginMethod("email")}
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
                  onClick={() => setLoginMethod("phone")}
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
                          setValue("phone_number", value);
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

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don’t have an account?{" "}
                    <Link
                      href="/auth/signup"
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Sign up
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
