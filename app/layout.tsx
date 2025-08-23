// app/layout.tsx
"use client";
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from './context/AuthContext';
import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <SessionProvider>
          <AuthProvider>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              {children}
            </Suspense>
            <Toaster />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}