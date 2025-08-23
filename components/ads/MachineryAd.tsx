"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Ad {
  id: string;
  type: string;
  title: string;
  description: string;
  image: string;
  link_url: string;
  company_name: string;
  sponsor_name: string;
  display_location: string;
  priority: number;
  content: string;
  campaign_id: string;
  event_name: string;
  event_date: string;
  time_out?: number | null;
  status?: string;
  start_date?: string;
  end_date?: string;
}

interface AdCardProps {
  ads: Ad[]; // Up to 3 ads
  index: number;
}

const AdCard = ({ ads, index }: AdCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const allImages = ads
    .map((ad) => ad.image)
    .filter((img): img is string => typeof img === "string" && img.trim() !== "");

  const getCurrentAdIndex = () => {
    let imageCount = 0;
    for (let i = 0; i < ads.length; i++) {
      if (ads[i].image && ads[i].image.trim() !== "") {
        if (imageCount === currentImageIndex) {
          return i;
        }
        imageCount++;
      }
    }
    return 0;
  };

  const currentAdIndex = getCurrentAdIndex();

  useEffect(() => {
    if (allImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 3000 + index * 500);

    return () => clearInterval(interval);
  }, [allImages.length, index]);

  if (!isVisible || ads.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="mb-4"
    >
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative group">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 z-10 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Close ad"
        >
          <X className="h-3 w-3" />
        </button>

        <div className="relative h-48 w-full overflow-hidden">
          {allImages.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={allImages[currentImageIndex]}
                alt={ads[currentAdIndex].title}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No image available</span>
            </div>
          )}

          {allImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {allImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          <div className="absolute top-2 left-2">
            <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
              {ads[0].type}
            </span>
          </div>
        </div>

        <CardContent className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAdIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">
                {ads[currentAdIndex].title}
              </h3>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {ads[currentAdIndex].description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 truncate">
                  {ads[currentAdIndex].company_name}
                </span>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" asChild>
                  <a
                    href={ads[currentAdIndex].link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </a>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface SingleAdCardProps {
  ad: Ad;
  index: number;
}

const SingleAdCard = ({ ad, index }: SingleAdCardProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="mb-4"
    >
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative group">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 z-10 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Close ad"
        >
          <X className="h-3 w-3" />
        </button>

        {ad.image ? (
          <img
            src={ad.image}
            alt={ad.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No image available</span>
          </div>
        )}

        <CardContent className="p-4">
          <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">{ad.title}</h3>
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{ad.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 truncate">{ad.company_name}</span>
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" asChild>
              <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface MachineryAdProps {
  className?: string;
  title?: string;
  adType?: string;
  display_location?: string;
  isFixed?: boolean;
}

export default function MachineryAd({
  className = "",
  title = "Sponsored",
  adType = "",
  display_location = "",
  isFixed = false,
}: MachineryAdProps) {
  const [visibleAds, setVisibleAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const groupAds = (ads: Ad[]): Ad[][] => {
    const grouped: Ad[][] = [];
    for (let i = 0; i < ads.length; i += 3) {
      grouped.push(ads.slice(i, i + 3));
    }
    return grouped;
  };

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = "";
        if (adType) query += `type=${encodeURIComponent(adType)}`;
        if (display_location) query += (query ? "&" : "") + `display_location=${encodeURIComponent(display_location)}`;

        const response = await fetch(`/api/ads?${query}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch ads");
        }
        setVisibleAds(data.results || data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [adType, display_location]);

  // Separate ads by time_out presence and sort by priority ascending
  const adsWithoutTimeout = visibleAds
    .filter((ad) => ad.time_out === null || ad.time_out === undefined)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  const adsWithTimeout = visibleAds
    .filter((ad) => ad.time_out !== null && ad.time_out !== undefined)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  const groupedAdsWithTimeout = groupAds(adsWithTimeout);

  return (
    <div className={`${className} ${isFixed ? "sticky top-24 self-start" : ""}`}>
      <div className="bg-white rounded-lg shadow-sm border p-4">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Ads
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Loading ads...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* Ads with null time_out shown singly, non-scrollable */}
            {adsWithoutTimeout.length > 0 && (
              <div className="mb-6">
                {adsWithoutTimeout.map((ad, idx) => (
                  <SingleAdCard key={ad.id} ad={ad} index={idx} />
                ))}
              </div>
            )}

            {/* Ads with time_out grouped and scrollable */}
            <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {groupedAdsWithTimeout.length > 0 ? (
                groupedAdsWithTimeout.map((group, idx) => (
                  <AdCard key={idx} ads={group} index={idx} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No ads to display</p>
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Sponsored content &bull; <a href="#" className="underline">Ad preferences</a>
          </p>
        </div>

      </div>
    </div>
  );
}
