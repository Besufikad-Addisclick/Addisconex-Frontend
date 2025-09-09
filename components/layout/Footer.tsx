import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">AddisCon-EX</h3>
            <p className="mb-4">
              Ethiopia's premier construction marketplace connecting suppliers, contractors, professionals, and agencies for seamless project delivery.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/suppliers" className="hover:text-white transition-colors">
                  Suppliers
                </Link>
              </li>
              <li>
                <Link href="/dashboard/machineries" className="hover:text-white transition-colors">
                  Machineries
                </Link>
              </li>
              <li>
                <Link href="/dashboard/consultants" className="hover:text-white transition-colors">
                  Consultants
                </Link>
              </li>
              <li>
                <Link href="/dashboard/agencies" className="hover:text-white transition-colors">
                  Agencies
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Platform Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Material Price Tracking
                </Link>
              </li>
              <li>
                <Link href="/dashboard/suppliers" className="hover:text-white transition-colors">
                  Supplier Directory
                </Link>
              </li>
              <li>
                <Link href="/dashboard/machineries" className="hover:text-white transition-colors">
                  Machinery Rental
                </Link>
              </li>
              <li>
                <Link href="/dashboard/consultants" className="hover:text-white transition-colors">
                  Professional Services
                </Link>
              </li>
              <li>
                <Link href="/dashboard/agencies" className="hover:text-white transition-colors">
                  Labor Agencies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span>Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                <span>+251 911 223 344</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <span>support@addisconex.com</span>
              </li>
              <li className="text-sm text-gray-400 mt-4">
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} AddisCon-EX. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}