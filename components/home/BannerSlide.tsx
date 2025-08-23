/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BannerSlideProps {
  title: string;
  subtitle: string;
  type: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  image: string;
  imageAlt: string;
  className?: string;
  imagePosition?: 'left' | 'right';
}

const BannerSlide = ({
  title,
  subtitle,
  type,
  description,
  buttonText,
  buttonLink,
  secondaryButtonText,
  secondaryButtonLink,
  image,
  imageAlt,
  className,
  imagePosition = 'right'
}: BannerSlideProps) => {
  return (
    <div
      className={cn(
        "h-full w-full flex flex-col lg:flex-row items-center",
        imagePosition === 'left' ? 'lg:flex-row-reverse' : '',
        className
      )}
    >
      {/* Text Content */}
      <div
        className={cn(
          "w-full lg:w-1/2 h-full flex flex-col justify-center p-8 lg:p-12",
          imagePosition === 'right' ? 'lg:ml-16' : 'lg:mr-16'
        )}
      >
        <h2 className="text-sm font-medium text-primary mb-3 uppercase tracking-wide">
          {subtitle}  
        </h2>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 leading-tight">
          {title}
        </h1>
        <p className="mb-6 text-gray-600 max-w-lg text-base md:text-lg">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg">
            <a href={buttonLink}>{buttonText}</a>
          </Button>
          {secondaryButtonText && (
            <Button variant="outline" asChild size="lg">
              <a href={secondaryButtonLink || '#'}>{secondaryButtonText}</a>
            </Button>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="w-full lg:w-1/2 h-full">
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-full object-cover rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default BannerSlide;