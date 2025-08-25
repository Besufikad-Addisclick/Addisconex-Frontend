// app/dashboard/materials/[id]/MaterialDetail.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package,ArrowLeft, Building2, MapPin, Phone, Mail, Eye, Search, X, Filter, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from 'next/link';
import { fetchMaterialDetail } from './../../../services/materialService';
import { MaterialDetailResponse, Price } from './../../../types/material';
import AdsSection from '@/components/ads/AdsSection';

const supplierStatus = ['all', 'manufacturer', 'market'];

const ITEMS_PER_PAGE = 5;

interface Region {
  id: number;
  name: string;
}

interface FilterSidebarProps {
  className?: string;
  filters: {
    searchQuery: string;
    selectedRegion: string;
    selectedPriceType: string;
    minPrice: string;
    maxPrice: string;
  };
  regions: Region[];
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

const FilterSidebar = ({ className = "", filters, regions, onFilterChange, onClearFilters }: FilterSidebarProps) => {
  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Filter Suppliers</h2>
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
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search suppliers..."
            className="pl-10"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
          />
        </div>
      </div>

      {/* Region Filter */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">Region</h3>
        <RadioGroup 
          value={filters.selectedRegion} 
          onValueChange={(value) => onFilterChange({ ...filters, selectedRegion: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="region-all" />
            <Label htmlFor="region-all">All Regions</Label>
          </div>
          {regions.map((region) => (
            <div key={region.id} className="flex items-center space-x-2">
              <RadioGroupItem value={region.name} id={`region-${region.id}`} />
              <Label htmlFor={`region-${region.id}`}>{region.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Verification Status */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">Price</h3>
        <RadioGroup 
          value={filters.selectedPriceType} 
          onValueChange={(value) => onFilterChange({ ...filters, selectedPriceType: value })}
        >
          {supplierStatus.map((pricetype) => (
            <div key={pricetype} className="flex items-center space-x-2">
              <RadioGroupItem value={pricetype} id={`verification-${pricetype}`} />
              <Label htmlFor={`verification-${pricetype}`}>
                {pricetype === 'all' ? 'All Suppliers' : 
                 pricetype === 'market' ? 'Market Only' : 'Manufacturer Only'}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-4">Price Range</h3>
        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Minimum price"
            value={filters.minPrice}
            onChange={(e) => onFilterChange({ ...filters, minPrice: e.target.value })}
            min="0"
            className="w-full"
          />
          <Input
            type="number"
            placeholder="Maximum price"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange({ ...filters, maxPrice: e.target.value })}
            min="0"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

const PriceChangeIndicator = ({ change }: { change: number }) => {
  if (change > 0) {
    return (
      <div className="flex items-center text-green-600">
        <TrendingUp className="h-4 w-4 mr-1" />
        <span>+{change.toFixed(1)}%</span>
      </div>
    );
  } else if (change < 0) {
    return (
      <div className="flex items-center text-red-600">
        <TrendingDown className="h-4 w-4 mr-1" />
        <span>{change.toFixed(1)}%</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center text-gray-600">
        <span>0%</span>
      </div>
    );
  }
};

const getRegionName = (regionId: number): string => {
  const regionMap: { [key: number]: string } = {
    1: 'Amhara',
    2: 'Addis Ababa',
    3: 'Afar'
  };
  return regionMap[regionId] || 'Unknown';
};

export default function MaterialDetail() {
  const params = useParams();
  const router = useRouter();
  const materialId = params.id as string;
  
  const [materialData, setMaterialData] = useState<MaterialDetailResponse | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('price');
  const [filters, setFilters] = useState({
    searchQuery: '',
    selectedRegion: 'all',
    selectedPriceType: 'all',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    const loadMaterialData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Pass filters to the API call
        const data = await fetchMaterialDetail(materialId, { ...filters, sort_by: sortBy });
        setMaterialData(data);
        setRegions(data.regions || []); // Set regions from API response
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load material data');
      } finally {
        setLoading(false);
      }
    };

    if (materialId) {
      loadMaterialData();
    }
  }, [materialId, filters, sortBy]); // Re-fetch when filters or sortBy change

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedRegion: 'all',
      selectedPriceType: 'all',
      minPrice: '',
      maxPrice: ''
    });
    setCurrentPage(1);
  };

  // Use backend-filtered suppliers directly
  const suppliers = materialData?.prices.results || [];
  const totalPages = Math.ceil((materialData?.prices.count || 0) / ITEMS_PER_PAGE);
  const paginatedSuppliers = suppliers; // Backend handles pagination

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

  if (error) {
    return (
      <div className="text-center py-8">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!materialData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Material not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const { material, prices, priceHistoryData, pricePredictions } = materialData;

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Mobile Filter Button */}
      <div className="xl:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-[540px] overflow-y-auto">
            <FilterSidebar 
              filters={filters}
              regions={regions}
              onFilterChange={(newFilters) => {
                setFilters(newFilters);
                setCurrentPage(1);
              }}
              onClearFilters={clearFilters}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter Sidebar */}
      <div className="hidden xl:block w-60 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
        <FilterSidebar 
          filters={filters}
          regions={regions}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            setCurrentPage(1);
          }}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Materials
        </Button>

        {/* Material Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{material.name}</h1>
              <p className="text-lg text-gray-600 mb-2">{material.specification}</p>
              {material.description && (
                <p className="text-sm text-gray-500 mb-3">{material.description}</p>
              )}
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {material.category}
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Unit: {material.unit}
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Region: {material.region}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Suppliers ({materialData.prices.count || 0})
              </h2>
              <p className="text-sm text-gray-500">Compare prices from suppliers</p>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price (Low to High)</SelectItem>
                <SelectItem value="company">Company Name</SelectItem>
                <SelectItem value="date">Last Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Suppliers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden border"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Supplier Info
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Price
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Last Updated
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedSuppliers.map((price, index) => {
                  const supplier = price.user_details;
                  return (
                    <motion.tr
                      key={price.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 border-r border-gray-200">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {supplier.user_details.company_name}
                              {!supplier.manufacturer && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Market Price
                                </span>
                              )}
                              {supplier.manufacturer && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  Manufacturer Price
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {getRegionName(supplier.user_details.region)}
                            </div>
                            <div className="text-sm text-gray-500">{supplier.user_details.contact_person}</div>
                            <div className="text-xs text-gray-400">
                              {supplier.first_name} {supplier.last_name} | {supplier.phone_number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border-r border-gray-200">
                        <div className="font-medium text-gray-900">
                          ETB {parseFloat(price.price).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">per {material.unit}</div>
                        <div className="text-xs text-gray-400">
                          Date: {new Date(price.price_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border-r border-gray-200">
                        <div className="text-sm text-gray-900">
                          {new Date(price.updated_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(price.updated_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col gap-2">
                          <Button size="sm" asChild>
                            <Link href={`/dashboard/suppliers/${supplier.id}?materialId=${materialId}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Link>
                          </Button>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="p-1" title="Call">
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="p-1" title="Email">
                              <Mail className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {paginatedSuppliers.length} of {materialData.prices.count} suppliers
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* No Results Message */}
          {paginatedSuppliers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Building2 className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search terms.</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Price Analytics Section */}
        {priceHistoryData && priceHistoryData.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Price History - {material.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {priceHistoryData.map((point, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="relative w-full max-w-12 h-48 flex flex-col justify-end">
                        <div 
                          className="bg-red-200 rounded-t w-full transition-all duration-300 hover:bg-red-300"
                          style={{ 
                            height: `${(point.max / Math.max(...priceHistoryData.map(p => p.max))) * 100}%`,
                            minHeight: '8px'
                          }}
                          title={`Max: ETB ${point.max}`}
                        ></div>
                        <div 
                          className="bg-primary rounded w-full transition-all duration-300 hover:bg-primary/80 -mt-1"
                          style={{ 
                            height: `${(point.avg / Math.max(...priceHistoryData.map(p => p.max))) * 85}%`,
                            minHeight: '6px'
                          }}
                          title={`Avg: ETB ${point.avg}`}
                        ></div>
                        <div 
                          className="bg-green-200 rounded-b w-full transition-all duration-300 hover:bg-green-300 -mt-1"
                          style={{ 
                            height: `${(point.min / Math.max(...priceHistoryData.map(p => p.max))) * 70}%`,
                            minHeight: '4px'
                          }}
                          title={`Min: ETB ${point.min}`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                        {point.month}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-200 rounded mr-2"></div>
                    <span>Max Price</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-primary rounded mr-2"></div>
                    <span>Average Price</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
                    <span>Min Price</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Monthly Price History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Month</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Min Price</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Max Price</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Avg Price</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Change (%)</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Change (Amount)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceHistoryData.map((data, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{data.month}</div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="font-medium text-gray-900">
                              ETB {data.min.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="font-medium text-gray-900">
                              ETB {data.max.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="font-medium text-gray-900">
                              ETB {data.avg.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <PriceChangeIndicator change={data.change} />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className={`font-medium ${
                              data.changeAmount > 0 ? 'text-green-600' : 
                              data.changeAmount < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {data.changeAmount > 0 ? '+' : ''}ETB {data.changeAmount}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {pricePredictions && pricePredictions.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Price Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricePredictions.map((prediction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{prediction.timeframe}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {prediction.confidence}% Confidence
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-sm text-gray-500">Current: </span>
                          <span className="font-medium">ETB {prediction.currentPrice.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Predicted: </span>
                          <span className="font-medium">ETB {prediction.predictedPrice.toLocaleString()}</span>
                        </div>
                        <div>
                          <PriceChangeIndicator change={prediction.change} />
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 w-32">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${prediction.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
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