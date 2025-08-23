"use client";

import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import AdsSection from "@/components/ads/AdsSection";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";




// Fetch categories and materials from API
type TopMaterial = {
  id: string;
  name: string;
  specification: string;
  unit: string;
  latest_price: {
    id: string;
    price: number;
    price_date: string | null;
    user: string;
  } | null;
};

type TopCategory = {
  id: string | number;
  name: string;
  materials: TopMaterial[];
};


// Helper to format category titles
const categoryTitles: Record<string, string> = {
  cement: "Cement",
  steel: "Steel",
  concrete: "Concrete",
  wood: "Wood",
  paint: "Paint",
  sand: "Sand",
  aggregate: "Aggregate",
  blocks: "Blocks",
  bricks: "Bricks",
  tiles: "Tiles",
  glass: "Glass",
  aluminum: "Aluminum",
  gypsum: "Gypsum",
  pvc: "PVC",
  electrical: "Electrical",
  sanitary: "Sanitary",
  roofing: "Roofing",
  doors: "Doors",
  windows: "Windows",
  admixtures: "Admixtures",
  bitumen: "Bitumen",
  'paint-accessories': "Paint Accessories",
  others: "Others",
};

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<TopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('Cement & Concrete');
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/materials/top-materials-by-category/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch materials");
        return res.json();
      })
      .then((data) => {
        setCategories(data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch materials");
        setLoading(false);
      });
  }, []);

  // Find the selected category object
  const selectedCatObj = categories.find((cat) =>
    selectedCategory && cat.name.toLowerCase().replace(/\s|&/g, "-") === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8 px-2 sm:px-4 lg:px-8 ">
        <div className="max-w-9xl mx-auto mt-14">
          {/* Horizontal category filter for large screens */}
          <div className="hidden lg:grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {categories.map((cat) => {
              const catSlug = cat.name.toLowerCase().replace(/\s|&/g, "-");
              return (
                <Button key={cat.id} asChild variant={selectedCategory === catSlug ? "default" : "outline"} className="w-full">
                  <Link href={`/products?category=${catSlug}`}>{cat.name}</Link>
                </Button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main content (table) - on left for large screens */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                {selectedCatObj ? `${selectedCatObj.name} Prices` : "Select a Product Category"}
              </h2>
              {loading ? (
                <div className="bg-white rounded-lg shadow p-6 overflow-x-auto relative animate-pulse">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-6 py-3">
                          <div className="h-4 w-24 bg-gray-200 rounded" />
                        </th>
                        <th className="px-6 py-3">
                          <div className="h-4 w-24 bg-gray-200 rounded" />
                        </th>
                        <th className="px-6 py-3">
                          <div className="h-4 w-24 bg-gray-200 rounded" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(6)].map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4">
                            <div className="h-4 w-32 bg-gray-200 rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-20 bg-gray-200 rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-16 bg-gray-200 rounded" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1">
                    <div className="h-10 w-40 bg-gray-200 rounded-full" />
                  </div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500">{error}</div>
              ) : selectedCatObj && selectedCatObj.materials.length > 0 ? (
                <div className="bg-white rounded-lg shadow p-6 overflow-x-auto relative">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedCatObj.materials.map((mat, idx) => (
                        <tr key={mat.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{mat.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {mat.latest_price ? `${mat.latest_price.price.toLocaleString()} Birr` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">{mat.unit}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {mat.latest_price ? `${mat.latest_price.price_date} ` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1">
                    <Button asChild variant="default" size="sm" className="shadow-lg px-6 rounded-full">
                      <Link href="/auth/signup">Continue Reading</Link>
                    </Button>
                  </div>
                </div>
              ) : selectedCategory ? (
                <div className="text-center text-gray-500">No data available for this category.</div>
              ) : (
                <div className="text-center text-gray-500">Please select a product category above.</div>
              )}
            </div>
            {/* Ads section - always on right for large screens */}
            <div className="lg:col-span-1 order-3 lg:order-2">
              <AdsSection
                        title="Sponsored Deals"
                        adType=""
                        display_location="ad_sections"
                      />
            </div>
            {/* Side menu for categories (drawer on mobile) */}
            <div className="lg:col-span-1 order-1 lg:order-3">
              {/* Mobile: show menu button */}
              <div className="block lg:hidden mb-4">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => setShowDrawer(true)}>
                  <Menu className="w-5 h-5" />
                  Filter Category
                </Button>
              </div>
              {/* Drawer overlay */}
              {showDrawer && (
                <div className="fixed inset-0 z-40 bg-black/40 flex">
                  <div className="bg-white w-64 h-full p-6 shadow-lg animate-slide-in-left flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-bold text-lg">Categories</span>
                      <button onClick={() => setShowDrawer(false)} className="text-gray-500 hover:text-gray-900 text-2xl">&times;</button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {categories.map((cat) => {
                        const catSlug = cat.name.toLowerCase().replace(/\s|&/g, "-");
                        return (
                          <Button key={cat.id} asChild variant={selectedCategory === catSlug ? "default" : "outline"} className="w-full" onClick={() => setShowDrawer(false)}>
                            <Link href={`/products?category=${catSlug}`}>{cat.name}</Link>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Click outside to close */}
                  <div className="flex-1" onClick={() => setShowDrawer(false)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
// Add slide-in animation for drawer
// Add this to your global CSS if not present:
// @keyframes slide-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
// .animate-slide-in-left { animation: slide-in-left 0.3s ease; }
}
