/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

// Define the interface for client data
interface Client {
  name: string;
  logo: string;
}

// Define the props interface for TrustedClients
interface TrustedClientsProps {
  featured_ads?: Array<{
    id: string;
    type: string;
    title: string;
    company_name: string;
    image: string;
  }>;
}


export default function TrustedClients({ featured_ads }: TrustedClientsProps) {
  const ref = useRef(null);
  const isInView = useInView(ref);
  const controls = useAnimation();

  // Only use featured_ads of type sponsor_logo, no dummy data
  const clients: Client[] = featured_ads
    ? featured_ads
        .filter(ad => ad.type === 'sponsor_logo')
        .map(ad => ({
          name: ad.company_name,
          logo: ad.image,
        }))
    : [];

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  if (!clients.length) return null;
  return (
    <section ref={ref} className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-12">
          Trusted by Leading Companies
        </h2>
        <div className="flex overflow-hidden">
          <motion.div
            className="flex space-x-12 animate-scroll"
            initial={{ x: 0 }}
            animate={{ x: '-100%' }}
            transition={{
              repeat: Infinity,
              duration: 20,
              ease: 'linear'
            }}
          >
            {[...clients, ...clients].map((client, index) => (
              <div
                key={index}
                className="flex items-center justify-center min-w-[200px]"
              >
                <img
                  src={client.logo}
                  alt={client.name}
                  className="h-16 object-contain rounded-xl hover:brightness-110 hover:shadow-md transition-all duration-300"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
