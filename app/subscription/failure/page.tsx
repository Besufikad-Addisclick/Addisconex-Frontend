"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, LogOut } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SubscriptionFailurePage() {
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.location.href = "/checkout";
    }, 5000); // Redirect after 5 seconds

    return () => clearTimeout(timeout); // Cleanup timeout on unmount
  }, []);

  const handleLogout = () => {
    console.log("Logging out user...");
    signOut({ 
      redirect: false,
      callbackUrl: '/'
    });
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex justify-between items-center p-4 bg-white shadow-sm">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome to AddisConX!
          </h1>
          <p className="text-gray-600">
            There was an issue with your subscription.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="flex items-center"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
      <div className="container mx-auto p-6">
        <Card className="shadow-lg bg-white max-w-md mx-auto">
          <CardHeader className="bg-[#BF6818] text-white">
            <CardTitle className="text-2xl font-bold">
              Payment Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <Alert className="mb-6 bg-red-100 text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              <AlertDescription>
                Your subscription payment failed. Please try again or contact
                support. You will be redirected to the checkout page in 5 seconds.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-4">
              <Button
                onClick={() => { window.location.href = "/checkout"; }}
                className="bg-[#BF6818] hover:bg-[#a65c15] text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => { window.location.href = "/checkout"; }}
                className="text-gray-700"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}