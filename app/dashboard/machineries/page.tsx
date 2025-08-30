/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import {
  PhoneCall,
  Share2,
  Bookmark,
  Filter,
  Search,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Region,
  Category,
  Machinery,
  MachineriesData,
} from "@/app/types/machinery";
import MachineryAd from "@/components/ads/MachineryAd";
import Link from "next/link";

// Mock ads data

// Fallback image URL for missing images
const FALLBACK_IMAGE_URL =
  "https://via.placeholder.com/300x200?text=No+Image+Available";

interface MachineryCardProps {
  machinery: Machinery;
  onClick: () => void;
  className?: string;
}

const MachineryCard = ({
  machinery,
  onClick,
  className = "",
}: MachineryCardProps) => {
  const imageSrc =
    machinery.imageUrl || machinery.machineryImageUrl || FALLBACK_IMAGE_URL;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow h-[240px] sm:h-[260px] flex-shrink-0",
        className
      )}
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={imageSrc}
          alt={machinery.name}
          className="w-full h-24 sm:h-28 object-cover"
        />
        <Badge
          className={cn(
            "absolute top-2 right-2 text-xs",
            machinery.type === "sale" ? "bg-blue-500" : "bg-green-500"
          )}
        >
          {machinery.type === "sale" ? "For Sale" : "For Rent"}
        </Badge>
        {machinery.featured && (
          <Badge className="absolute top-2 left-2 bg-green-500 text-xs">
            Featured
          </Badge>
        )}
      </div>
      <div className="p-3 flex flex-col h-[116px] sm:h-[132px]">
        <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2">
          {machinery.name}
        </h3>
        <div className="flex items-center text-gray-600 text-xs mb-2">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">
            {machinery.location}, {machinery.supplier.region_name}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-base sm:text-lg font-bold text-primary truncate">
              {Number(machinery.price).toLocaleString()} ETB
            </p>

            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>
                {machinery.type === "rent" && machinery.rental_duration
                  ? machinery.rental_duration
                  : ""}
              </span>
              <span>{machinery.supplier.phone}</span>
            </div>
          </div>

          {/* <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <PhoneCall className="h-4 w-4" />
            {machinery.supplier.phone}
          </Button> */}
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 sm:py-16 px-4"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-4 sm:mb-6"
      >
        <X className="h-16 w-16 sm:h-24 sm:w-24 text-gray-300" />
      </motion.div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
        No Equipment Found
      </h3>
      <p className="text-gray-500 text-center max-w-md text-sm sm:text-base">
        We couldn&apost find any equipment matching your search criteria. Try
        adjusting your filters or search terms.
      </p>
    </motion.div>
  );
};

interface FilterSidebarProps {
  className?: string;
  filters: {
    search: string;
    selectedRegion: string;
    selectedCategories: string[];
    minPrice: string;
    maxPrice: string;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
  categories: Category[];
  regions: Region[];
  isMobile?: boolean;
}

const FilterSidebar = ({
  className = "",
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  regions,
  isMobile = false,
}: FilterSidebarProps) => {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleRegionChange = (value: string) => {
    onFilterChange({ ...filters, selectedRegion: value });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...filters.selectedCategories, categoryId]
      : filters.selectedCategories.filter((id) => id !== categoryId);
    onFilterChange({ ...filters, selectedCategories: updatedCategories });
  };

  const handlePriceChange = (type: "min" | "max", value: string) => {
    onFilterChange({
      ...filters,
      [type === "min" ? "minPrice" : "maxPrice"]: value,
    });
  };

  return (
    <div className={`bg-white rounded-lg p-4 sm:p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold">Filter Equipment</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-xs"
          >
            Clear All
          </Button>
          {isMobile && (
            <SheetClose asChild>
              <Button variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          )}
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          <Input
            placeholder="Search machinery..."
            className="pl-8 sm:pl-10 text-sm"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
          Category
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {categories.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${option.id}`}
                checked={filters.selectedCategories.includes(String(option.id))}
                onCheckedChange={(checked) =>
                  handleCategoryChange(String(option.id), checked as boolean)
                }
              />
              <label
                htmlFor={`category-${option.id}`}
                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
          Region
        </h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="region-all"
              checked={filters.selectedRegion === "all"}
              onCheckedChange={(checked) =>
                handleRegionChange(checked ? "all" : "")
              }
            />
            <label
              htmlFor="region-all"
              className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              All Regions
            </label>
          </div>
          {regions.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`region-${option.id}`}
                checked={filters.selectedRegion === String(option.id)}
                onCheckedChange={(checked) =>
                  handleRegionChange(checked ? String(option.id) : "")
                }
              />
              <label
                htmlFor={`region-${option.id}`}
                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
          Price Range
        </h3>
        <div className="space-y-2 sm:space-y-3">
          <Input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handlePriceChange("min", e.target.value)}
            className="w-full text-sm"
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handlePriceChange("max", e.target.value)}
            className="w-full text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default function MachineriesPage() {
  const [data, setData] = useState<MachineriesData>({
    suppliers: [],
    featured: [],
    regions: [],
    categories: [],
    next: null,
    previous: null,
    count: 0,
  });
  const [selectedMachinery, setSelectedMachinery] = useState<Machinery | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    search: "",
    selectedRegion: "all",
    selectedCategories: [] as string[],
    minPrice: "",
    maxPrice: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [featuredStartIndex, setFeaturedStartIndex] = useState(0);
  const [hasAds, setHasAds] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const router = useRouter();

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(4);
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const fetchData = useCallback(
    debounce(async (filters: any, pageNum = 1) => {
      if (pageNum > 1) setIsLoadingMore(true);
      setIsLoading(pageNum === 1);
      try {
        const filterParams = {
          search: filters.search,
          selectedRegion:
            filters.selectedRegion === "all" ? "" : filters.selectedRegion,
          selectedCategories: filters.selectedCategories.join(","),
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          page: pageNum,
          page_size: 10,
        };
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(filterParams)) {
          if (value) queryParams.append(key, String(value));
        }
        const response = await fetch(
          `/api/machineries?${queryParams.toString()}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to fetch machineries: ${response.status}`
          );
        }

        const result = await response.json();
        // console.log("API Response:", result);

        // Map backend response (user) to frontend expected structure (supplier)
        const normalizedData: MachineriesData = {
          suppliers: (result.suppliers || []).map((item: any) => ({
            ...item,
            supplier: item.user,
            price: String(item.price),
          })),
          featured: (result.featured || []).map((item: any) => ({
            ...item,
            supplier: item.user,
            price: String(item.price),
          })),
          regions: (result.regions || []).map((region: any) => ({
            ...region,
            id: region.id,
          })),
          categories: (result.categories || []).map((category: any) => ({
            ...category,
            id: category.id,
          })),
          next: result.next || null,
          previous: result.previous || null,
          count: result.count || null,
        };

        setData((prev) => ({
          ...normalizedData,
          suppliers:
            pageNum === 1
              ? normalizedData.suppliers
              : [...prev.suppliers, ...normalizedData.suppliers],
          featured: normalizedData.featured,
        }));
      } catch (err: any) {
        // console.error("Error fetching machineries:", err.message);
        setData({
          suppliers: [],
          featured: [],
          regions: [],
          categories: [],
          next: null,
          previous: null,
          count: 0,
        });
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }, 300),
    [router]
  );

  useEffect(() => {
    fetchData(filters, 1);
    setPage(1);
  }, [filters, fetchData]);

  const handleLoadMore = () => {
    if (data.next) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(filters, nextPage);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      selectedRegion: "all",
      selectedCategories: [],
      minPrice: "",
      maxPrice: "",
    });
    setActiveTab("all");
  };

  const visibleFeaturedMachineries = data.featured.slice(
    featuredStartIndex,
    featuredStartIndex + itemsPerPage
  );
  const canLoadMoreFeatured =
    featuredStartIndex + itemsPerPage < data.featured.length;
  const canLoadBackFeatured = featuredStartIndex > 0;

  const handleLoadMoreFeatured = () => {
    if (canLoadMoreFeatured) {
      setFeaturedStartIndex((prev) => prev + itemsPerPage);
    }
  };

  const handleLoadBackFeatured = () => {
    if (canLoadBackFeatured) {
      setFeaturedStartIndex((prev) => Math.max(0, prev - itemsPerPage));
    }
  };

  const filteredMachineries =
    activeTab === "featured"
      ? data.featured
      : data.suppliers.filter((m) => {
          const matchesTab =
            activeTab === "all" ||
            (activeTab === "sale" && m.type === "sale") ||
            (activeTab === "rent" && m.type === "rent");
          return matchesTab;
        });

  const showEmptyState =
    !isLoading && filteredMachineries.length === 0 && data.next === null;

  const getGridColumns = () => {
    return hasAds
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { repeat: Infinity, duration: 2, ease: "linear" },
              scale: { repeat: Infinity, duration: 1, ease: "easeInOut" },
            }}
          >
            <X className="w-12 h-12 text-primary" />
          </motion.div>
          <p className="text-lg font-medium text-gray-700">
            Loading Machineries...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-full sm:w-[400px] overflow-y-auto"
          >
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
              categories={data.categories}
              regions={data.regions}
              isMobile={true}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
        <FilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={handleClearFilters}
          categories={data.categories}
          regions={data.regions}
          isMobile={false}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-end mb-4 sm:mb-6 gap-2 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            <Badge
              variant={activeTab === "featured" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-white transition-colors text-xs sm:text-sm whitespace-nowrap"
              onClick={() => setActiveTab("featured")}
            >
              Featured
            </Badge>
            <Badge
              variant={activeTab === "sale" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-white transition-colors text-xs sm:text-sm whitespace-nowrap"
              onClick={() => setActiveTab("sale")}
            >
              For Sale
            </Badge>
            <Badge
              variant={activeTab === "rent" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-white transition-colors text-xs sm:text-sm whitespace-nowrap"
              onClick={() => setActiveTab("rent")}
            >
              For Rent
            </Badge>
            <Badge
              variant={activeTab === "all" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-white transition-colors text-xs sm:text-sm whitespace-nowrap"
              onClick={() => setActiveTab("all")}
            >
              All
            </Badge>
          </div>
        </div>

        {showEmptyState ? (
          <EmptyState />
        ) : (
          <>
            {data.featured.length > 0 &&
              activeTab !== "sale" &&
              activeTab !== "rent" && (
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold">
                      Featured Equipment
                    </h2>
                    <div className="flex items-center gap-2 justify-center sm:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoadBackFeatured}
                        disabled={!canLoadBackFeatured}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Back</span>
                      </Button>
                      <span className="text-xs sm:text-sm text-gray-500 px-1 sm:px-2 whitespace-nowrap">
                        {featuredStartIndex + 1}-
                        {Math.min(
                          featuredStartIndex + itemsPerPage,
                          data.featured.length
                        )}{" "}
                        of {data.featured.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoadMoreFeatured}
                        disabled={!canLoadMoreFeatured}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">More</span>
                        <span className="sm:hidden">More</span>
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>

                  <div
                    className={`grid gap-3 sm:gap-4 bg-gray-200 p-1 ${
                      itemsPerPage === 1
                        ? "grid-cols-1"
                        : itemsPerPage === 2
                        ? "grid-cols-2"
                        : "grid-cols-4"
                    }`}
                  >
                    {visibleFeaturedMachineries.map((machinery) => (
                      <MachineryCard
                        key={machinery.id}
                        machinery={machinery}
                        className="w-full"
                        onClick={() => {
                          // console.log(machinery);
                          setSelectedMachinery(machinery);
                          setIsDetailOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

            <div
              className={`flex gap-6 ${hasAds ? "lg:flex-row" : ""} flex-col`}
            >
              <div className={hasAds ? "flex-1" : "w-full"}>
                <h2 className="text-lg sm:text-xl font-semibold mb-4">
                  {activeTab === "all"
                    ? "All Equipment"
                    : activeTab === "featured"
                    ? "Featured Equipment"
                    : activeTab === "sale"
                    ? "Equipment for Sale"
                    : "Equipment for Rent"}
                </h2>
                <div className={`grid ${getGridColumns()} gap-3 sm:gap-4`}>
                  {filteredMachineries.map((machinery) => (
                    <MachineryCard
                      key={machinery.id}
                      machinery={machinery}
                      onClick={() => {
                        setSelectedMachinery(machinery);
                        // console.log(machinery);
                        setIsDetailOpen(true);
                      }}
                    />
                  ))}
                </div>

                {data.next && (
                  <div className="flex justify-center mt-6 sm:mt-8">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      className="text-sm"
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? "Loading more" : "Load More"}
                    </Button>
                  </div>
                )}
              </div>

              {hasAds && (
                <div className="hidden lg:block w-80 flex-shrink-0">
                  <div className="sticky top-24">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                      Sponsored
                    </h3>
                    <div className="space-y-4">
                      <MachineryAd
                        adType=""
                        display_location="ad_sections"
                        title="Sponsored Ads"
                        isFixed={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xs sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
          <VisuallyHidden>
            <DialogTitle>
              {selectedMachinery ? selectedMachinery.name : "Machinery Details"}
            </DialogTitle>
          </VisuallyHidden>
          {selectedMachinery && (
            <div className="space-y-4 sm:space-y-6">
              <div className="relative">
                <img
                  src={
                    selectedMachinery.imageUrl ||
                    selectedMachinery.machineryImageUrl ||
                    FALLBACK_IMAGE_URL
                  }
                  alt={selectedMachinery.name}
                  className="w-full h-48 sm:h-64 object-cover rounded-lg"
                />
                <Badge
                  className={cn(
                    "absolute top-2 sm:top-3 right-2 sm:right-3 text-xs",
                    selectedMachinery.type === "sale"
                      ? "bg-blue-500"
                      : "bg-green-500"
                  )}
                >
                  {selectedMachinery.type === "sale" ? "For Sale" : "For Rent"}
                </Badge>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold truncate">
                      {selectedMachinery.name}
                    </h2>
                    <p className="text-lg sm:text-xl font-semibold text-primary">
                      {Number(selectedMachinery.price).toLocaleString()} ETB
                      {selectedMachinery.type === "rent" &&
                      selectedMachinery.rental_duration
                        ? selectedMachinery.rental_duration
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">
                      {selectedMachinery.uploadedAt}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">
                      Year: {selectedMachinery.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">
                      {selectedMachinery.location},{" "}
                      {selectedMachinery.supplier.region_name}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3 sm:pt-4">
                  <h3 className="font-semibold mb-3 text-sm sm:text-base">
                    Specifications
                  </h3>
                  {selectedMachinery.specification ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex justify-between text-sm">
                        {selectedMachinery.specification}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No specifications available
                    </p>
                  )}
                </div>

                <div className="border-t pt-3 sm:pt-4">
                  <h3 className="font-semibold mb-3 text-sm sm:text-base">
                    Supplier Information
                  </h3>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {selectedMachinery.supplier.name}
                        </p>
                        <p className="text-gray-600 text-sm truncate">
                          {selectedMachinery.supplier.company_address}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {/* <PhoneCall className="h-4 w-4" /> */}
                          {selectedMachinery.supplier.user_email}
                        </p>
                      </div>
                      <Button className="w-full sm:w-auto" onClick={() => (window.location.href = `tel:${selectedMachinery.supplier.phone}`)}>
                        <PhoneCall className="h-4 w-4 mr-2" />
                        {selectedMachinery.supplier.phone}
                      </Button>

                      <Button size="sm" asChild variant="success">
                        <Link
                          href={`/dashboard/suppliers/${selectedMachinery.supplier?.user_id}?materialId=weiuoruw`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Supplier Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
