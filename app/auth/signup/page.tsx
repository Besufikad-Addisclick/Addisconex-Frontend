"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const signupSchema = z
  .object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine(
        (value) => /[A-Z]/.test(value),
        "Password must contain at least one uppercase letter"
      )
      .refine(
        (value) => /[a-z]/.test(value),
        "Password must contain at least one lowercase letter"
      )
      .refine(
        (value) => /[0-9]/.test(value),
        "Password must contain at least one number"
      )
      .refine(
        (value) => /[^A-Za-z0-9]/.test(value),
        "Password must contain at least one special character"
      ),
    password2: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
    phone_number: z
      .string()
      .regex(/^\+2519\d{8}$/, "Enter a valid Ethiopian phone number like +251912345678"),
    user_type: z.enum(
      [
        "contractors",
        "suppliers",
        "subcontractors",
        "consultants",
        "investors",
        "professionals",
        "agencies",
      ],
      {
        required_error: "Please select a user type",
      }
    ),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");


  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);

      // Ensure phoneNumber has + prefix
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Ensure phoneNumber is set in the form data
      const formData = {
        ...data,
        phone_number: formattedPhoneNumber,
      };
      console.log(formData);
      
      // Call your existing signup API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiUrl}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Registration error:', errorData);

        let toastMessage = 'Registration failed';
        if (errorData) {
          const assignFieldError = (field: string, message: string) => {
            try {
              setError(field as any, { type: 'server', message });
            } catch {}
          };

          if (typeof errorData === 'object') {
            const aggregated: string[] = [];
            for (const [key, val] of Object.entries(errorData)) {
              if (Array.isArray(val)) {
                const msg = (val as string[]).join(' ');
                if (key === 'non_field_errors') {
                  aggregated.push(msg);
                } else {
                  assignFieldError(key, msg);
                }
              } else if (typeof val === 'string') {
                if (key === 'non_field_errors') {
                  aggregated.push(val);
                } else {
                  assignFieldError(key, val);
                }
              }
            }
            if (aggregated.length > 0) {
              toastMessage = aggregated[0];
            } else if ((errorData as any).message) {
              toastMessage = (errorData as any).message as string;
            }
          }
        }

        toast({
          title: 'Error',
          description: toastMessage,
          variant: 'destructive',
        });

        setIsLoading(false);
        return;
      }
      toast({
        title: "Success!",
        description:
          "Your account has been created successfully. Please login.",
      });

      router.push("/auth/login");
    } catch (error: any) {
      
      toast({
        title: "Error",
        description:
          error.message || "An unexpected error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                Create Account
              </CardTitle>
              <p className="mt-2 text-sm text-gray-600">
                Join us to start your construction journey
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="First Name"
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                      {...register("first_name")}
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.first_name.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="Last Name"
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                      {...register("last_name")}
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.last_name.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email address"
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message as string}
                      </p>
                    )}
                  </div>

                  <div className="relative">
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
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password.message as string}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <Input
                      id="password2"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                      {...register("password2")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {errors.password2 && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password2.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <PhoneInput
                      country={"et"}
                      value={phoneNumber}
                      onChange={(value) => {
                        setPhoneNumber(value);
                        setValue("phone_number", value ? `+${value}` : ""); // Ensure + prefix for submission/validation
                      }}
                      buttonClass="phone-input-button"
                      // containerStyle={{ border: "1px solid gray" }}
                      countryCodeEditable={false}
                      inputStyle={{
                        background: "white",
                        width: "100%",
                        height: "40px",
                      }}
                    />
                    {errors.phone_number && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone_number.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <Select
                      onValueChange={(value) => {
                        setValue("user_type", value);
                        
                      }}
                    >
                      <SelectTrigger className="w-full transition-all duration-300 focus:ring-2 focus:ring-primary/50">
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suppliers">Suppliers</SelectItem>
                        <SelectItem value="contractors">Contractors</SelectItem>
                        <SelectItem value="subcontractors">
                          Subcontractors
                        </SelectItem>
                        <SelectItem value="consultants">Consultants</SelectItem>
                        <SelectItem value="investors">Investors</SelectItem>
                        <SelectItem value="professionals">
                          Professionals
                        </SelectItem>
                        <SelectItem value="agencies">Agencies</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.user_type && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.user_type.message as string}
                      </p>
                    )}
                  </div>
                  
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
                    "Create Account"
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Sign in
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
