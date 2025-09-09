/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import {
  Share2,
  Bookmark,
  Filter,
  Building2,
  Search,
  MapPin,
  Users,
  Star,
  Phone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Subcontractor,
  Region,
  Category,
  SubcontractorsData,
} from "@/app/types/subcontractor";
import AdsSection from "@/components/ads/AdsSection";

// Fallback image URL
const FALLBACK_IMAGE_URL =
  "/int.png";

interface FilterSidebarProps {
  className?: string;
  filters: {
    searchQuery: string;
    region: string;
    categories: string[];
    minYears: string;
    maxYears: string;
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
  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Filter Professionals</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
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

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search professionals..."
            className="pl-10"
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-4">Region</h3>
        <RadioGroup
          value={filters.region}
          onValueChange={(value) =>
            onFilterChange({ ...filters, region: value })
          }
        >
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="" id="region-all" />
            <Label htmlFor="region-all">All Regions</Label>
          </div>
          {regions.map((region) => (
            <div key={region.id} className="flex items-center space-x-2">
              <RadioGroupItem
                value={String(region.id)}
                id={`region-${region.id}`}
              />
              <Label htmlFor={`region-${region.id}`}>{region.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.categories.includes(category.id)}
                onCheckedChange={(checked) => {
                  const newCategories = checked
                    ? [...filters.categories, category.id]
                    : filters.categories.filter((c) => c !== category.id);
                  onFilterChange({ ...filters, categories: newCategories });
                }}
              />
              <label
                htmlFor={`category-${category.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Years of Experience</h3>
        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Minimum years"
            value={filters.minYears}
            onChange={(e) =>
              onFilterChange({ ...filters, minYears: e.target.value })
            }
            min="0"
            className="w-full"
          />
          <Input
            type="number"
            placeholder="Maximum years"
            value={filters.maxYears}
            onChange={(e) =>
              onFilterChange({ ...filters, maxYears: e.target.value })
            }
            min="0"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

const SubcontractorCard = ({ contractor }: { contractor: Subcontractor }) => {
  const imageSrc = contractor.imageUrl || FALLBACK_IMAGE_URL;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group hover:shadow-lg transition-shadow"
    >
      <Link
        href={`/dashboard/professionals/${contractor.id}`}
        className="block h-full w-full focus:outline-none"
      >
        {/* Image on top, full width */}
        <div className="w-full h-48 overflow-hidden">
          <img
            src={imageSrc}
            alt={contractor.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Bottom Info */}
        <div className="p-4 flex flex-col flex-grow justify-end">
          {/* Name */}
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
            {contractor.name}
          </h3>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <div>
               {contractor.yearsOfExperience}{" "}
              {contractor.yearsOfExperience === 1 ? "year" : "years"}
            </div>
            <div>
             {contractor.phone}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="self-start">
              {contractor.category}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">
                {contractor.rating !== undefined && contractor.rating !== null
                  ? contractor.rating
                  : "N/A"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
          <Badge variant="outline" className="self-start mt-2">
              {contractor.region}
            </Badge>
          </div>
          
          {/* Salary Information - Bottom of card, full width, centered */}
          {(contractor.salary_min || contractor.salary_max) && (
            <div className="w-full text-center mt-3 pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Salary: </span>
                <span>
                  {contractor.salary_min && contractor.salary_max
                    ? `${parseFloat(contractor.salary_min).toLocaleString()} - ${parseFloat(contractor.salary_max).toLocaleString()} ETB`
                    : contractor.salary_min 
                    ? `From ${parseFloat(contractor.salary_min).toLocaleString()} ETB`
                    : `Up to ${parseFloat(contractor.salary_max!).toLocaleString()} ETB`}
                  {contractor.salary_negotiable && (
                    <span className="text-green-600 ml-1">(Negotiable)</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>
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
        No Professionals Found
      </h3>
      <p className="text-gray-500 text-center max-w-md text-sm sm:text-base">
        We couldn&apos;t find any Professionals matching your search criteria.
        Try adjusting your filters or search terms.
      </p>
    </motion.div>
  );
};



export default function ProfessionalsPage() {
  const [data, setData] = useState<SubcontractorsData>({
    subcontractors: [],
    categories: [],
    regions: [],
    next: null,
    previous: null,
    count: 0,
  });
  const [filters, setFilters] = useState({
    searchQuery: "",
    region: "",
    categories: [] as string[],
    minYears: "",
    maxYears: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchData = useCallback(
    debounce(async (filters: any, pageNum = 1) => {
      if (pageNum > 1) setIsLoadingMore(true);
      setIsLoading(pageNum === 1);
      try {
        const filterParams = {
          search: filters.searchQuery,
          region: filters.region,
          categories: filters.categories.join(","),
          min_years: filters.minYears,
          max_years: filters.maxYears,
          page: pageNum,
          page_size: 10,
        };
        console.log("filterParams:", filterParams);
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(filterParams)) {
          if (value) queryParams.append(key, String(value));
        }
        const response = await fetch(
          `/api/professionals/?${queryParams.toString()}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Failed to fetch professionals: ${response.status}`
          );
        }

        const result = await response.json();
        console.log("API Response:", result);

        const normalizedData: SubcontractorsData = {
          subcontractors: (result.users.results || []).map((item: any) => ({
            id: item.id,
            name:
              `${item.first_name} ${item.last_name}`,
            companyAddress: item.user_details.company_address,
            category: item.user_details.category?.name || "Unknown",
            region:
              typeof item.user_details.regions === "object"
                ? item.user_details.regions.name
                : "Unknown",
            rating: item.average_rate || null,
            completedProjects: item.key_projects?.length || 0,
            yearsOfExperience: item.user_details.year_of_experience || 0,
            phone: item.phone_number,
            email: item.email,
            license: item.documents?.[0]?.file_type || "N/A",
            specialization: item.user_details.equipment || [],
            imageUrl: item.profile_picture || null,
            salary_min: item.user_details.salary_min || null,
            salary_max: item.user_details.salary_max || null,
            salary_negotiable: item.user_details.salary_negotiable || false,
          })),
          categories: (result.categories || []).map((category: any) => ({
            id: category.id,
            name: category.name,
          })),
          regions: (result.regions || []).map((region: any) => ({
            id: region.id,
            name: region.name,
            note: region.note,
            created_at: region.created_at,
            updated_at: region.updated_at,
          })),
          next: result.users.next || null,
          previous: result.users.previous || null,
          count: result.users.count || 0,
        };

        setData((prev) => ({
          ...normalizedData,
          subcontractors:
            pageNum === 1
              ? normalizedData.subcontractors
              : [...prev.subcontractors, ...normalizedData.subcontractors],
          categories:
            normalizedData.categories.length > 0
              ? normalizedData.categories
              : prev.categories,
          regions:
            normalizedData.regions.length > 0
              ? normalizedData.regions
              : prev.regions,
        }));
      } catch (err: any) {
        console.log("Error fetching professionals:", err.message);
        setData({
          subcontractors: [],
          categories: [],
          regions: [],
          next: null,
          previous: null,
          count: 0,
        });
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }, 300),
    []
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

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      region: "",
      categories: [],
      minYears: "",
      maxYears: "",
    });
    setIsSheetOpen(false);
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
            Loading professionals...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Filter Button - Always modal */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center gap-4">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
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
                  onFilterChange={(newFilters) => {
                    setFilters(newFilters);
                    setIsSheetOpen(false);
                  }}
                  onClearFilters={clearFilters}
                  categories={data.categories}
                  regions={data.regions}
                  isMobile={true}
                />
              </SheetContent>
            </Sheet>
            
            {/* Active Filters Display */}
            <div className="text-sm text-gray-600">
              {filters.region && (
                <span>Region: {data.regions.find(r => String(r.id) === String(filters.region))?.name || filters.region}</span>
              )}
              {filters.region && filters.categories.length > 0 && " • "}
              {filters.categories.length > 0 && (
                <span>
                  Categories: {filters.categories.map(catId => 
                    data.categories.find(cat => String(cat.id) === String(catId))?.name
                  ).filter(Boolean).join(", ")}
                </span>
              )}
              {(filters.region || filters.categories.length > 0) && (filters.minYears || filters.maxYears) && " • "}
              {(filters.minYears || filters.maxYears) && (
                <span>
                  Experience: {filters.minYears ? `${filters.minYears}` : "0"} - {filters.maxYears || "∞"} years
                </span>
              )}
            </div>
          </div>
          
          {/* Results count */}
          <div className="text-sm text-gray-600">
            {data.count > 0 && (
              <span>{data.subcontractors.length} of {data.count} professionals</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {data.subcontractors.length === 0 && data.next === null ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.subcontractors.map((contractor) => (
                <SubcontractorCard key={contractor.id} contractor={contractor} />
              ))}
            </div>
          )}

          {data.next && (
            <div className="flex justify-center mt-8 mb-8">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading more":"Load More"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Ads Section - Right side for larger screens */}
      <div className="hidden lg:block w-1/4 xl:w-1/4 2xl:w-80 flex-shrink-0">
        <AdsSection title="Sponsored Deals"
            adType=""
            display_location="ad_sections" />
      </div>

      {/* Ads Section - Bottom for smaller screens */}
      <div className="lg:hidden mt-6">
        <AdsSection title="Sponsored Deals"
            adType=""
            display_location="ad_sections" />
      </div>
    </div>
  );
}
