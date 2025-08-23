/* eslint-disable @next/next/no-img-element */
"use client";

import React, { memo } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  image: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Construction Manager',
    company: 'ABC Construction',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    content: 'ConstructMate has revolutionized how we source materials. The real-time price tracking saves us both time and money.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Project Director',
    company: 'Smith & Partners',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    content: 'The supplier verification system gives us confidence in our material sourcing. Excellent platform!',
    rating: 5,
  },
  {
    id: 3,
    name: 'Michael Johnson',
    role: 'Procurement Manager',
    company: 'Johnson Construction',
    image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    content: 'Being able to compare prices across different suppliers has significantly improved our procurement process.',
    rating: 4,
  },
];


const Testimonials = memo(() => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from construction professionals who have transformed their material procurement process with ConstructMate.
          </p>
        </div>
        {/* Zigzag infinite horizontal scroll */}
        <div className="relative w-full overflow-x-hidden">
          <motion.div
            className="flex gap-6 min-w-full pb-2"
            style={{ willChange: 'transform' }}
            animate={{ x: [0, -1000] }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'linear',
              duration: 40,
            }}
          >
            {/* Repeat testimonials for infinite effect */}
            {[...testimonials, ...testimonials].map((testimonial, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-xs flex-shrink-0 flex flex-col items-center text-center transition-transform duration-300 ${
                  idx % 2 === 0 ? 'mt-0 mb-8' : 'mt-8 mb-0'
                }`}
                style={{
                  transform: `translateY(${idx % 2 === 0 ? '0px' : '32px'})`,
                }}
              >
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover mb-3"
                />
                <div className="flex mb-2">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-base mb-4 italic">
                  {testimonial.content}
                </p>
                <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
                <p className="text-sm text-gray-600">{testimonial.company}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
});

Testimonials.displayName = 'Testimonials';

export default Testimonials;
