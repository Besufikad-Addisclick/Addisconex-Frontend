"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import BannerSlide from './BannerSlide';

// Define the interface for the banner slides
interface BannerSlide {
  id: number | string;
  title: string;
  type: string,
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  image: string;
  imageAlt: string;
  imagePosition: 'left' | 'right';
}

// Define the props interface for the Banner component
interface BannerProps {
  featured_ads?: Array<{
    id: string;
    title: string;
    type: string;
    company_name: string;
    description: string;
    image: string;
    link_url: string;
  }>;
}

const Banner = memo<BannerProps>(({ featured_ads }) => {
  // Only use featured_ads, no dummy data
  const bannerSlides: BannerSlide[] = featured_ads
    ? featured_ads
        .filter(ad => ad.type === 'banner').map(ad => ({
        id: ad.id,
        title: ad.title,
        type: ad.type,
        subtitle: ad.company_name,
        description: ad.description,
        buttonText: "Learn More",
        buttonLink: ad.link_url,
        image: ad.image,
        imageAlt: ad.title,
        imagePosition: "right" // Default position
      }))
    : [];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const goToNextSlide = useCallback(() => {
    setDirection('right');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
      setIsAnimating(false);
    }, 500);
  }, [bannerSlides.length]);

  const goToPrevSlide = useCallback(() => {
    setDirection('left');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
      setIsAnimating(false);
    }, 500);
  }, [bannerSlides.length]);

  useEffect(() => {
    const interval = setInterval(goToNextSlide, 6000);
    return () => clearInterval(interval);
  }, [goToNextSlide]);

  if (!bannerSlides.length) return null;
  return (
    <div className="relative overflow-hidden h-screen bg-gray-50">
      <div
        className={`transition-transform duration-500 ease-in-out flex w-full h-full ${
          isAnimating
            ? direction === 'right'
              ? 'translate-x-[-10%] opacity-80'
              : 'translate-x-[10%] opacity-80'
            : 'translate-x-0 opacity-100'
        }`}
      >
        {bannerSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`w-full flex-shrink-0 h-full ${
              index === currentSlide ? 'block' : 'hidden'
            }`}
          >
            <BannerSlide {...slide} />
          </div>
        ))}
      </div>
      {/* Navigation buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-primary w-6' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
      {/* Arrow buttons */}
      {/* <Button
        variant="secondary"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full shadow-lg bg-white/80 hover:bg-white"
        onClick={goToPrevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full shadow-lg bg-white/80 hover:bg-white"
        onClick={goToNextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button> */}
    </div>
  );
});

Banner.displayName = 'Banner';

export default Banner;
