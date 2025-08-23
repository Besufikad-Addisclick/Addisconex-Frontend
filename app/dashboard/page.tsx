/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Filter,
  Search,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import AdsSection from "@/components/ads/AdsSection";
import {
  fetchCategoryMaterials,
  CategoryMaterialsResponse,
} from "@/app/utils/api";

const INITIAL_ITEMS = 5;
const LOAD_MORE_COUNT = 5;

interface Materials {
  id: string;
  name: string;
  category: string;
  specification: string;
  unit: string;
  region: string;
  market: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    change: number;
  };
  manufactured: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    change: number;
  };
}

const PriceChangeIndicator = ({ change }: { change: number }) => {
  if (change > 0) {
    return (
      <div className="flex items-center justify-center text-green-600">
        <TrendingUp className="h-4 w-4 mr-1" />
        <span>+{change}%</span>
      </div>
    );
  } else if (change < 0) {
    return (
      <div className="flex items-center justify-center text-red-600">
        <TrendingDown className="h-4 w-4 mr-1" />
        <span>{change}%</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center text-gray-600">
        <Minus className="h-4 w-4 mr-1" />
        <span>0%</span>
      </div>
    );
  }
};

interface FilterSidebarProps {
  className?: string;
  filters: {
    searchQuery: string;
    selectedRegion: string;
    minPrice: string;
    maxPrice: string;
    page: string;
    page_size: string;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
  categories: { id: string; name: string }[];
  regions: { id: string; name: string }[];
}

const FilterSidebar = ({
  className = "",
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  regions,
}: FilterSidebarProps) => {
  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Filter Materials</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-4">Category</h3>
        <RadioGroup
          value={filters.searchQuery}
          onValueChange={(value) =>
            onFilterChange({ ...filters, searchQuery: value })
          }
        >
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <RadioGroupItem
                value={category.name}
                id={`category-${category.id}`}
              />
              <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-4">Region</h3>
        <RadioGroup
          value={filters.selectedRegion}
          onValueChange={(value) =>
            onFilterChange({ ...filters, selectedRegion: value })
          }
        >
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="all" id="region-all" />
            <Label htmlFor="region-all">All Regions</Label>
          </div>
          {regions.map((region) => (
            <div key={region.id} className="flex items-center space-x-2">
              <RadioGroupItem value={region.id} id={`region-${region.id}`} />
              <Label htmlFor={`region-${region.id}`}>{region.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Price Range</h3>
        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Minimum price"
            value={filters.minPrice}
            onChange={(e) =>
              onFilterChange({ ...filters, minPrice: e.target.value })
            }
            min="0"
            className="w-full"
          />
          <Input
            type="number"
            placeholder="Maximum price"
            value={filters.maxPrice}
            onChange={(e) =>
              onFilterChange({ ...filters, maxPrice: e.target.value })
            }
            min="0"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState("Concrete Work"); // Default to Cement & Concrete
  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState({
    searchQuery: "Cement & Concrete", // Default to Cement & Concrete
    selectedRegion: "all",
    minPrice: "",
    maxPrice: "",
    page: "1",
    page_size: INITIAL_ITEMS.toString(),
  });
  const [data, setData] = useState<CategoryMaterialsResponse>({
    categories: [],
    regions: [],
    materials: {
      count: 0,
      next: null,
      previous: null,
      results: [],
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch materials when category or filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchCategoryMaterials(selectedCategory, {
          ...filters,
          page: "1", // Reset to page 1 on filter or category change
          searchQuery: selectedCategory, // Ensure searchQuery matches selectedCategory
        });
        console.log('selectedCategory', selectedCategory);
        console.log(response)
        setData(response);
        setVisibleCount(INITIAL_ITEMS);
      } catch (err: any) {
        setError(
          err.message === "HTTP error! status: 401"
            ? "Unauthorized: Please log in again."
            : "Failed to fetch materials data"
        );
        console.error("[DashboardPage] Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [
    selectedCategory,
    filters.selectedRegion,
    filters.minPrice,
    filters.maxPrice,
  ]);

  const loadMore = async () => {
    if (data.materials.next) {
      setLoading(true);
      try {
        const nextPage = (parseInt(filters.page) + 1).toString();
        const response = await fetchCategoryMaterials(selectedCategory, {
          ...filters,
          page: nextPage,
          searchQuery: selectedCategory,
        });
        setData({
          ...data,
          materials: {
            ...response.materials,
            results: [...data.materials.results, ...response.materials.results],
          },
        });
        setFilters({ ...filters, page: nextPage });
        setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
      } catch (err: any) {
        setError(
          err.message === "HTTP error! status: 401"
            ? "Unauthorized: Please log in again."
            : "Failed to load more materials"
        );
        console.error("[DashboardPage] Load more error:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
    }
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: selectedCategory, // Preserve selected category
      selectedRegion: "all",
      minPrice: "",
      maxPrice: "",
      page: "1",
      page_size: INITIAL_ITEMS.toString(),
    });
    setVisibleCount(INITIAL_ITEMS);
  };

  const filteredMaterials = useMemo(() => {
    let filtered = data.materials.results;

    // Region filter (client-side validation)
    if (filters.selectedRegion && filters.selectedRegion !== "all") {
      filtered = filtered.filter(
        (material) =>
          material.region ===
          data.regions.find((r) => r.id === filters.selectedRegion)?.name
      );
    }

    // Price filter
    const minPrice = filters.minPrice
      ? parseFloat(filters.minPrice)
      : -Infinity;
    const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
    if (filters.minPrice || filters.maxPrice) {
      filtered = filtered.filter(
        (material) =>
          material.market.avgPrice >= minPrice &&
          material.market.avgPrice <= maxPrice
      );
    }

    // Sort materials
    // filtered.sort((a, b) => {
    //   let aValue, bValue;
    //   switch (sortBy) {
    //     case "name":
    //       aValue = a.name;
    //       bValue = b.name;
    //       break;
    //     case "marketMinPrice":
    //       aValue = a.market.minPrice;
    //       bValue = b.market.minPrice;
    //       break;
    //     case "marketMaxPrice":
    //       aValue = a.market.maxPrice;
    //       bValue = b.market.maxPrice;
    //       break;
    //     case "marketAvgPrice":
    //       aValue = a.market.avgPrice;
    //       bValue = b.market.avgPrice;
    //       break;
    //     case "marketChange":
    //       aValue = a.market.change;
    //       bValue = b.market.change;
    //       break;
    //     default:
    //       aValue = a.name;
    //       bValue = b.name;
    //   }

    //   if (typeof aValue === "string") {
    //     return sortOrder === "asc"
    //       ? aValue.localeCompare(bValue)
    //       : bValue.localeCompare(aValue);
    //   } else {
    //     return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    //   }
    // });
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "marketMinPrice":
          aValue = a.market.minPrice;
          bValue = b.market.minPrice;
          break;
        case "marketMaxPrice":
          aValue = a.market.maxPrice;
          bValue = b.market.maxPrice;
          break;
        case "marketAvgPrice":
          aValue = a.market.avgPrice;
          bValue = b.market.avgPrice;
          break;
        case "marketChange":
          aValue = a.market.change;
          bValue = b.market.change;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        // Ensure numeric comparison for numbers
        return sortOrder === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [
    data.materials.results,
    filters.selectedRegion,
    filters.minPrice,
    filters.maxPrice,
    sortBy,
    sortOrder,
  ]);

  const visibleMaterials = filteredMaterials.slice(0, visibleCount);
  const hasMore =
    visibleCount < filteredMaterials.length || data.materials.next !== null;

  const selectedCategoryName = selectedCategory;

  const stats = useMemo(() => {
    const materials = filteredMaterials;
    return {
      totalMaterials: materials.length,
      avgMarketPrice:
        materials.length > 0
          ? Math.round(
              materials.reduce((sum, m) => sum + m.market.avgPrice, 0) /
                materials.length
            )
          : 0,
      avgManufacturedPrice:
        materials.length > 0
          ? Math.round(
              materials.reduce((sum, m) => sum + m.manufactured.avgPrice, 0) /
                materials.length
            )
          : 0,
      avgMarketChange:
        materials.length > 0
          ? (
              materials.reduce((sum, m) => sum + m.market.change, 0) /
              materials.length
            ).toFixed(1)
          : "0.0",
    };
  }, [filteredMaterials]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setVisibleCount(INITIAL_ITEMS);
  };

  if (loading) {
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
            <Package className="w-12 h-12 text-warning" />
          </motion.div>
          <p className="text-lg font-medium text-gray-700">
            Loading Materials...
          </p>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="flex flex-col xl:flex-row">
      {error && (
        <div className="p-4 text-red-600">
          {error}
          {error.includes("Unauthorized") && (
            <div>
              <Link href="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="xl:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-full sm:w-[540px] overflow-y-auto"
          >
            <FilterSidebar
              filters={filters}
              onFilterChange={(newFilters) => {
                setFilters({ ...newFilters, page: "1" });
                setSelectedCategory(newFilters.searchQuery); // Update selectedCategory
                setVisibleCount(INITIAL_ITEMS);
              }}
              onClearFilters={clearFilters}
              categories={data.categories}
              regions={data.regions}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden xl:block w-80 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
        <FilterSidebar
          filters={filters}
          onFilterChange={(newFilters) => {
            setFilters({ ...newFilters, page: "1" });
            setSelectedCategory(newFilters.searchQuery); // Update selectedCategory
            setVisibleCount(INITIAL_ITEMS);
          }}
          onClearFilters={clearFilters}
          categories={data.categories}
          regions={data.regions}
        />
      </div>

      <div className="flex-1 min-w-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Materials
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalMaterials}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Avg Market Price
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              ETB {stats.avgMarketPrice.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Avg Manufactured Price
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              ETB {stats.avgManufacturedPrice.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Avg Market Change
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats.avgMarketChange}%
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Material Price Overview
            </h1>
            <p className="text-gray-600">
              Track material prices across different categories
            </p>
          </div>

          <div className="w-full sm:w-auto flex gap-4">
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setFilters({ ...filters, searchQuery: value, page: "1" });
                setVisibleCount(INITIAL_ITEMS);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {data.categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-");
                setSortBy(field);
                setSortOrder(order as "asc" | "desc");
                setVisibleCount(INITIAL_ITEMS);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="marketMinPrice-asc">
                  Market Min (Low-High)
                </SelectItem>
                <SelectItem value="marketMinPrice-desc">
                  Market Min (High-Low)
                </SelectItem>
                <SelectItem value="marketMaxPrice-asc">
                  Market Max (Low-High)
                </SelectItem>
                <SelectItem value="marketMaxPrice-desc">
                  Market Max (High-Low)
                </SelectItem>
                <SelectItem value="marketChange-desc">
                  Market Change (High-Low)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden border"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedCategoryName} Materials ({filteredMaterials.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 border-r border-gray-200 sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center hover:text-primary"
                    >
                      Material
                      {sortBy === "name" && (
                        <span className="ml-1">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>

                  <th
                    colSpan={4}
                    className="px-4 py-2 text-center text-sm font-bold text-white bg-blue-600 border-r border-gray-200"
                  >
                    Market Price (ETB)
                  </th>

                  <th
                    colSpan={4}
                    className="px-4 py-2 text-center text-sm font-bold text-white bg-green-600 border-r border-gray-200"
                  >
                    Manufactured Price (ETB)
                  </th>

                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
                <tr>
                  <th className="px-4 py-2 border-r border-gray-200 sticky left-0 bg-gray-50 z-10"></th>

                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900 border-r border-gray-200 bg-blue-50">
                    <button
                      onClick={() => handleSort("marketMinPrice")}
                      className="hover:text-primary"
                    >
                      Min{" "}
                      {sortBy === "marketMinPrice" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </button>
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900 border-r border-gray-200 bg-blue-50">
                    <button
                      onClick={() => handleSort("marketMaxPrice")}
                      className="hover:text-primary"
                    >
                      Max{" "}
                      {sortBy === "marketMaxPrice" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </button>
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900 border-r border-gray-200 bg-blue-50">
                    <button
                      onClick={() => handleSort("marketChange")}
                      className="hover:text-primary"
                    >
                      % Change{" "}
                      {sortBy === "marketChange" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </button>
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900 border-r border-gray-200 bg-blue-50">
                    <button
                      onClick={() => handleSort("marketAvgPrice")}
                      className="hover:text-primary"
                    >
                      Average{" "}
                      {sortBy === "marketAvgPrice" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </button>
                  </th>

                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900 border-r border-gray-200 bg-green-50">
                    Min
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900 border-r border-gray-200 bg-green-50">
                    Max
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900 border-r border-gray-200 bg-green-50">
                    % Change
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900 border-r border-gray-200 bg-green-50">
                    Average
                  </th>

                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visibleMaterials.map((material, index) => (
                  <motion.tr
                    key={material.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 border-r border-gray-200 sticky left-0 bg-white z-10">
                      <div>
                        <div className="font-medium text-gray-900">
                          {material.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {material.specification}
                        </div>
                        <div className="text-xs text-gray-400">
                          per {material.unit} • {material.region}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center border-r border-gray-200 bg-blue-50/30">
                      <div className="font-medium text-gray-900">
                        {material.market.minPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center border-r border-gray-200 bg-blue-50/30">
                      <div className="font-medium text-gray-900">
                        {material.market.maxPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center border-r border-gray-200 bg-blue-50/30">
                      <PriceChangeIndicator change={material.market.change} />
                    </td>
                    <td className="px-4 py-4 text-center border-r border-gray-200 bg-blue-50/30">
                      <div className="font-medium text-gray-900">
                        {material.market.avgPrice.toLocaleString()}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center border-r border-gray-200 bg-green-50/30">
                      <div className="font-medium text-gray-900">
                        {material.manufactured.minPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center border-r border-gray-200 bg-green-50/30">
                      <div className="font-medium text-gray-900">
                        {material.manufactured.maxPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center border-r border-gray-200 bg-green-50/30">
                      <PriceChangeIndicator
                        change={material.manufactured.change}
                      />
                    </td>
                    <td className="px-4 py-4 text-center border-r border-gray-200 bg-green-50/30">
                      <div className="font-medium text-gray-900">
                        ETB {material.manufactured.avgPrice.toLocaleString()}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/materials/${material.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          See Details
                        </Link>
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="px-6 py-4 border-t border-gray-200 text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                className="w-full sm:w-auto"
                disabled={loading}
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Load More ({Math.max(
                  data.materials.count - visibleCount,
                  0
                )}{" "}
                remaining)
              </Button>
            </div>
          )}

          {filteredMaterials.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No materials found matching your criteria.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="hidden xl:block w-80 flex-shrink-0">
        <AdsSection
          title="Sponsored Deals"
          adType=""
          display_location="ad_sections"
        />
      </div>
    </div>
  );
}
