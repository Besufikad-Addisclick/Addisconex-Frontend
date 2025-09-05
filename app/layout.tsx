// app/layout.tsx
"use client";
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from './context/AuthContext';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from 'react';
import { LazyWrapper } from '@/components/performance/LazyWrapper';



// Lazy load heavy components
const LazyToaster = lazy(() => import("@/components/ui/toaster").then(module => ({ default: module.Toaster })));

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body  suppressHydrationWarning>
        <SessionProvider>
          <AuthProvider>
            <LazyWrapper fallback={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-600">Loading...</p>
                </div>
              </div>
            }>
              {children}
            </LazyWrapper>
            <LazyWrapper>
              <LazyToaster />
            </LazyWrapper>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}