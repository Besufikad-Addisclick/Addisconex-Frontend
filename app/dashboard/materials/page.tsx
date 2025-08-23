"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, ChevronDown, Building2, MapPin, Phone, Mail, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

// Mock data
const regions = [
  { id: '1', name: 'Addis Ababa' },
  { id: '2', name: 'Dire Dawa' },
  { id: '3', name: 'Bahir Dar' },
  { id: '4', name: 'Hawassa' }
];

const categories = [
  { id: '1', name: 'Cement & Concrete' },
  { id: '2', name: 'Steel & Metal' },
  { id: '3', name: 'Electrical' },
  { id: '4', name: 'Sanitary' },
  { id: '5', name: 'Wood & Timber' }
];

// Generate mock materials data
const generateMaterials = (count: number) => {
  const materialNames = [
    'Portland Cement', 'White Cement', 'Quick Setting Cement', 'Reinforcement Steel',
    'Mild Steel Plate', 'Steel Angle', 'Copper Wire', 'PVC Pipe', 'Ceramic Tiles',
    'Aluminum Sheet', 'Concrete Blocks', 'Insulation Material', 'Roofing Sheets',
    'Paint Primer', 'Waterproofing Membrane', 'Electrical Cable', 'Steel Bars',
    'Cement Blocks', 'Glass Panels', 'Wooden Planks'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    name: materialNames[i % materialNames.length] + ` ${Math.floor(i / materialNames.length) + 1}`,
    category: categories[i % categories.length].name,
    specification: `Grade ${40 + (i % 20)}`,
    unit: i % 3 === 0 ? 'ton' : i % 3 === 1 ? 'bag' : 'meter',
    region: regions[i % regions.length].name,
    description: `High-quality ${materialNames[i % materialNames.length].toLowerCase()} suitable for construction purposes.`,
    suppliersCount: Math.floor(Math.random() * 15) + 5,
    minPrice: Math.floor(Math.random() * 50000) + 500,
    maxPrice: Math.floor(Math.random() * 100000) + 50000,
    avgPrice: Math.floor(Math.random() * 75000) + 25000,
    priceChange: (Math.random() - 0.5) * 10, // -5% to +5%
    lastUpdated: '2025-04-28',
    priceHistory: Array.from({ length: 12 }, (_, monthIndex) => ({
      month: new Date(2024, monthIndex, 1).toLocaleDateString('en-US', { month: 'short' }),
      price: Math.floor(Math.random() * 20000) + 30000
    }))
  }));
};

const allMaterials = generateMaterials(50);

const INITIAL_ITEMS = 10;
const LOAD_MORE_COUNT = 10;

// Mock price prediction data
const pricePredictions = [
  {
    material: 'Portland Cement',
    currentPrice: 890,
    predictedPrice: 920,
    change: 3.4,
    confidence: 85,
    timeframe: '1 Month'
  },
  {
    material: 'Reinforcement Steel',
    currentPrice: 95000,
    predictedPrice: 92000,
    change: -3.2,
    confidence: 78,
    timeframe: '1 Month'
  },
  {
    material: 'White Cement',
    currentPrice: 1225,
    predictedPrice: 1280,
    change: 4.5,
    confidence: 82,
    timeframe: '1 Month'
  }
];

interface FilterSidebarProps {
  className?: string;
  filters: {
    searchQuery: string;
    selectedRegion: string;
    selectedCategories: string[];
    minPrice: string;
    maxPrice: string;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

const FilterSidebar = ({ className = "", filters, onFilterChange, onClearFilters }: FilterSidebarProps) => {
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
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search materials..."
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
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="" id="region-all" />
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

      {/* Categories Filter */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`category-${category.id}`}
                checked={filters.selectedCategories.includes(category.name)}
                onCheckedChange={(checked) => {
                  const newCategories = checked
                    ? [...filters.selectedCategories, category.name]
                    : filters.selectedCategories.filter(c => c !== category.name);
                  onFilterChange({ ...filters, selectedCategories: newCategories });
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

export default function MaterialsPage() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    searchQuery: '',
    selectedRegion: '',
    selectedCategories: [],
    minPrice: '',
    maxPrice: ''
  });

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedRegion: '',
      selectedCategories: [],
      minPrice: '',
      maxPrice: ''
    });
    setVisibleCount(INITIAL_ITEMS);
  };

  const filteredMaterials = useMemo(() => {
    let filtered = allMaterials;

    // Search filter
    if (filters.searchQuery) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        material.specification.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        material.category.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Region filter
    if (filters.selectedRegion) {
      filtered = filtered.filter(material => material.region === filters.selectedRegion);
    }

    // Categories filter
    // if (filters.selectedCategories.length > 0) {
    //   filtered = filtered.filter(material => 
    //      filters.selectedCategories.includes(material.category)
    //   );
    // }

    // Price filter
    const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : -Infinity;
    const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
    
    if (filters.minPrice || filters.maxPrice) {
      filtered = filtered.filter(material =>
        material.avgPrice >= minPrice && material.avgPrice <= maxPrice
      );
    }

    // Sort materials
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'minPrice':
          aValue = a.minPrice;
          bValue = b.minPrice;
          break;
        case 'maxPrice':
          aValue = a.maxPrice;
          bValue = b.maxPrice;
          break;
        case 'avgPrice':
          aValue = a.avgPrice;
          bValue = b.avgPrice;
          break;
        case 'suppliersCount':
          aValue = a.suppliersCount;
          bValue = b.suppliersCount;
          break;
        case 'priceChange':
          aValue = a.priceChange;
          bValue = b.priceChange;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [filters, sortBy, sortOrder]);

  const visibleMaterials = filteredMaterials.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMaterials.length;

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, filteredMaterials.length));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile Filter Button */}
      <div className="lg:hidden">
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
              onFilterChange={(newFilters) => {
                setFilters(newFilters);
                setVisibleCount(INITIAL_ITEMS);
              }}
              onClearFilters={clearFilters}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter Sidebar */}
      <div className="hidden lg:block w-80 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
        <FilterSidebar 
          filters={filters}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            setVisibleCount(INITIAL_ITEMS);
          }}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Materials</h1>
            <p className="text-gray-600">Browse and compare construction materials from verified suppliers</p>
          </div>
          
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-');
            setSortBy(field);
            setSortOrder(order as 'asc' | 'desc');
            setVisibleCount(INITIAL_ITEMS);
          }}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="minPrice-asc">Min Price (Low-High)</SelectItem>
              <SelectItem value="minPrice-desc">Min Price (High-Low)</SelectItem>
              <SelectItem value="maxPrice-asc">Max Price (Low-High)</SelectItem>
              <SelectItem value="maxPrice-desc">Max Price (High-Low)</SelectItem>
              <SelectItem value="avgPrice-asc">Avg Price (Low-High)</SelectItem>
              <SelectItem value="avgPrice-desc">Avg Price (High-Low)</SelectItem>
              <SelectItem value="priceChange-desc">Price Change (High-Low)</SelectItem>
              <SelectItem value="suppliersCount-desc">Most Suppliers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {visibleMaterials.length} of {filteredMaterials.length} materials
        </div>

        {/* Materials Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden border"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Material
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Min Price
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Max Price
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Avg Price
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Price Change
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Suppliers
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Action
                  </th>
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
                    <td className="px-6 py-4 border-r border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">{material.name}</div>
                        <div className="text-sm text-gray-500">{material.specification}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                            {material.category}
                          </span>
                          <span className="text-xs text-gray-400">
                            {material.region} • per {material.unit}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        ETB {material.minPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        ETB {material.maxPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        ETB {material.avgPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center border-r border-gray-200">
                      <PriceChangeIndicator change={material.priceChange} />
                    </td>
                    <td className="px-6 py-4 text-center border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        {material.suppliersCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/materials/${material.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="px-6 py-4 border-t border-gray-200 text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                className="w-full sm:w-auto"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Load More ({filteredMaterials.length - visibleCount} remaining)
              </Button>
            </div>
          )}

          {/* No Results Message */}
          {filteredMaterials.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Building2 className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search terms.</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Price Analytics Section */}
        <div className="space-y-8">
          {/* Price History Charts */}
          <Card>
            <CardHeader>
              <CardTitle>Price History Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allMaterials.slice(0, 3).map((material) => (
                  <div key={material.id} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{material.name}</h4>
                    <div className="h-32 flex items-end justify-between space-x-1">
                      {material.priceHistory.map((point, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="bg-primary rounded-t w-4 transition-all duration-300 hover:bg-primary/80"
                            style={{ 
                              height: `${(point.price / Math.max(...material.priceHistory.map(p => p.price))) * 100}%`,
                              minHeight: '8px'
                            }}
                          ></div>
                          <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                            {point.month}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      Current: ETB {material.avgPrice.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Predictions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Price Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Material</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Current Price</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Predicted Price</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Expected Change</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Confidence</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Timeframe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricePredictions.map((prediction, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{prediction.material}</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="font-medium text-gray-900">
                            ETB {prediction.currentPrice.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="font-medium text-gray-900">
                            ETB {prediction.predictedPrice.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <PriceChangeIndicator change={prediction.change} />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${prediction.confidence}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium">{prediction.confidence}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {prediction.timeframe}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}