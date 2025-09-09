"use client";

import { Check, Building2, Truck, Wrench, Users, Hammer, HardHat, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function ServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Animated Background Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Icons */}
        <div className="absolute top-20 left-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          <Building2 className="h-8 w-8 text-blue-300 opacity-40" />
        </div>
        <div className="absolute top-40 right-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
          <Truck className="h-10 w-10 text-green-300 opacity-40" />
        </div>
        <div className="absolute top-60 left-1/4 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
          <Wrench className="h-6 w-6 text-orange-300 opacity-40" />
        </div>
        <div className="absolute top-80 right-1/3 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}>
          <Users className="h-7 w-7 text-purple-300 opacity-40" />
        </div>
        <div className="absolute top-32 left-1/2 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.2s' }}>
          <Hammer className="h-9 w-9 text-red-300 opacity-40" />
        </div>
        <div className="absolute top-96 left-16 animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '4.2s' }}>
          <HardHat className="h-8 w-8 text-yellow-300 opacity-40" />
        </div>
        <div className="absolute top-48 right-10 animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '3.8s' }}>
          <Cog className="h-6 w-6 text-indigo-300 opacity-40" />
        </div>
        
        {/* Additional floating elements for bottom section */}
        <div className="absolute bottom-40 left-20 animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '3.6s' }}>
          <Building2 className="h-7 w-7 text-blue-300 opacity-35" />
        </div>
        <div className="absolute bottom-60 right-1/4 animate-bounce" style={{ animationDelay: '2.8s', animationDuration: '4.1s' }}>
          <Truck className="h-8 w-8 text-green-300 opacity-35" />
        </div>
        <div className="absolute bottom-80 left-1/3 animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '3.3s' }}>
          <Wrench className="h-5 w-5 text-orange-300 opacity-35" />
        </div>
        <div className="absolute bottom-32 right-16 animate-bounce" style={{ animationDelay: '1.8s', animationDuration: '4.3s' }}>
          <Users className="h-6 w-6 text-purple-300 opacity-35" />
        </div>
        <div className="absolute bottom-52 left-1/2 animate-bounce" style={{ animationDelay: '2.2s', animationDuration: '3.7s' }}>
          <Hammer className="h-7 w-7 text-red-300 opacity-35" />
        </div>
        <div className="absolute bottom-72 right-1/2 animate-bounce" style={{ animationDelay: '0.7s', animationDuration: '4.4s' }}>
          <HardHat className="h-6 w-6 text-yellow-300 opacity-35" />
        </div>
        <div className="absolute bottom-44 left-1/4 animate-bounce" style={{ animationDelay: '1.9s', animationDuration: '3.4s' }}>
          <Cog className="h-5 w-5 text-indigo-300 opacity-35" />
        </div>
      </div>
      
      <Header />
      <main className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 mt-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Platform Features
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              AddisCon-EX is Ethiopia's premier construction marketplace platform. We connect suppliers, contractors, professionals, and agencies to streamline construction projects across the country.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Material Price Tracking</h3>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Real-time material price monitoring</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Verified supplier network across Ethiopia</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Price comparison and market analysis</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Professional Network</h3>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Verified contractors and subcontractors</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Professional consultants and engineers</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Construction workers and specialists</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Machinery & Equipment</h3>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Construction machinery rental and sales</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Equipment availability tracking</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Verified equipment suppliers</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Labor Agencies</h3>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Skilled labor force connections</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Team size and specialization matching</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Verified agency partnerships</span>
                </li>
              </ul>
            </div>
            
            {/* Additional Feature Cards */}
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Project Management</h3>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">End-to-end project tracking</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Timeline and milestone management</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Resource allocation tools</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quality Assurance</h3>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Verified supplier credentials</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Quality standards compliance</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Performance monitoring</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Market Intelligence</h3>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Real-time market trends</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Price forecasting analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Regional market insights</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Additional Features Section */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Why Choose AddisCon-EX?
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform offers comprehensive solutions for all your construction needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Verified Network</h4>
                <p className="text-gray-600 text-sm">All suppliers and contractors are thoroughly verified</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Reliable Logistics</h4>
                <p className="text-gray-600 text-sm">Efficient supply chain and logistics management</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">24/7 Support</h4>
                <p className="text-gray-600 text-sm">Round-the-clock customer support and assistance</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Community Driven</h4>
                <p className="text-gray-600 text-sm">Built by and for the construction community</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex justify-center">
            <Button asChild>
              <Link href="/auth/login">
                Join the Platform
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
