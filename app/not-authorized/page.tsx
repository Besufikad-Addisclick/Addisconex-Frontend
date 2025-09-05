/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, LogOut, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

export default function NotAuthorizedPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: '/'
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex justify-between items-center p-4 bg-white shadow-sm">
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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleGoHome}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="shadow-lg bg-white max-w-md mx-auto">
          <CardHeader className="bg-red-500 text-white text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800">
                You don&apos;t have permission to access the dashboard. Your account type 
                <strong> `&quot;{session?.user?.userType || 'unknown'}&quot;`` </strong> 
                is not authorized for this area.
              </AlertDescription>
            </Alert>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                If you believe this is an error, please contact support or try logging in with a different account.
              </p>
              <p className="text-sm text-gray-500">
                Authorized user types: Contractors, Suppliers, Subcontractors, Consultants, Admin
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleGoHome}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Homepage
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout & Try Different Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}