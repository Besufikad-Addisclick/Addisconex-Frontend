
"use client";

import { useEffect, useState, memo } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Banner from "@/components/home/Banner";
import StatsSection from "@/components/home/StatsSection";
import Pricing from "@/components/home/Pricing";
import TrustedClients from "@/components/home/TrustedClients";
import Testimonials from "@/components/home/Testimonials";
import BlogSection from "@/components/home/BlogSection";
import BannerSkeleton from "@/components/home/BannerSkeleton";
import StatsSectionSkeleton from "@/components/home/StatsSectionSkeleton";
import TrustedClientsSkeleton from "@/components/home/TrustedClientsSkeleton";
import AnimatedError from "@/components/ui/AnimatedError";
import { FeaturedAdsResponse } from "./types/featuredAds";

const Home = memo(() => {
  const [featuredAds, setFeaturedAds] = useState<FeaturedAdsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedAds = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/ads/featured");
        if (!response.ok) {
          throw new Error("Failed to fetch featured ads");
        }
        const data: FeaturedAdsResponse = await response.json();
        setFeaturedAds(data);
      } catch (error: any) {
        setError(error?.message || "Error fetching featured ads");
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedAds();
  }, []);

  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col">
        {error ? (
          <>
            <Header />
            <AnimatedError message={error} />
          </>
        ) : loading ? (
          <>
            <Header />
            <BannerSkeleton />
            <StatsSectionSkeleton />
            <TrustedClientsSkeleton />
          </>
        ) : (
          <>
            <Header />
            {featuredAds?.featured_ads && featuredAds.featured_ads.length > 0 && (
              <Banner featured_ads={featuredAds.featured_ads} />
            )}
            <StatsSection />
            
            {featuredAds?.featured_ads && featuredAds.featured_ads.length > 0 && (
              <TrustedClients featured_ads={featuredAds?.featured_ads} />
            )}
            <Pricing />
            <Testimonials />
           
            {featuredAds?.latest_news && featuredAds.latest_news.length > 0 && (
               <BlogSection latest_news={featuredAds?.latest_news} />
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
});

Home.displayName = 'Home';

export default Home;
