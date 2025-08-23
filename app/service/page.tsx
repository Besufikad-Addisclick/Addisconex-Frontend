"use client";

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function ServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 mt-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Our Services
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              AddisClick provides a wide range of construction-related services to help your business grow and succeed. We connect you with trusted suppliers, skilled contractors, and essential resources for every stage of your project.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Material Supply</h3>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Access to a network of verified suppliers</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Competitive pricing and bulk order options</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Timely delivery to your project site</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Contractor Services</h3>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Skilled professionals for all construction needs</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Project management and supervision</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Quality assurance and compliance</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Equipment Rental</h3>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Wide selection of construction equipment</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Flexible rental periods</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">On-site support and maintenance</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Consultancy & Support</h3>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Expert advice for project planning</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Regulatory and compliance guidance</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-1" />
                  <span className="text-gray-600">Ongoing customer support</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex justify-center">
            <Button asChild>
              <Link href="/contact">
                Contact Us to Learn More
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
