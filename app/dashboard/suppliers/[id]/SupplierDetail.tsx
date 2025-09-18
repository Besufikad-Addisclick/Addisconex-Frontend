// app/dashboard/suppliers/[id]/SupplierDetail.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Star,
  Calendar,
  Package,
  Award,
  ChevronDown,
  Share2,
  Copy,
  Check,
  FileText,
  MessageSquare,
  ThumbsUp,
  User,
  Loader
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rating } from "@/components/ui/rating";
import { useToast } from "@/hooks/use-toast";
import AdsSection from "@/components/ads/AdsSection";
import { fetchSupplierDetail } from "./../../../services/materialService";
import { SupplierDetailResponse, Price } from "./../../../types/material";

const ITEMS_PER_PAGE = 5;

interface Rate {
  id: string;
  value: number;
  comment: string;
  created_at: string;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  rated_by_first_name: string;
  rated_by_last_name: string;
  rated_by_email: string;
}

export default function SupplierDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supplierId = params.id as string;
  const materialId = searchParams.get("materialId");

  const [supplierData, setSupplierData] =
    useState<SupplierDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materialPage, setMaterialPage] = useState(1);
  const [machineryPage, setMachineryPage] = useState(1);
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingMoreMaterials, setLoadingMoreMaterials] = useState(false);
  const [loadingMoreMachinery, setLoadingMoreMachinery] = useState(false);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [machineryLoading, setMachineryLoading] = useState(false);
  const [rates, setRates] = useState<Rate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  const fetchRates = async () => {
    try {
      const response = await fetch(`/api/reviews/${supplierId}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setRates(data.results || []);
      }
    } catch (err) {
      console.error("Error fetching rates:", err);
    }
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    if (!ratingComment.trim()) {
      toast({
        title: "Error",
        description: "Please write a review comment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/rate/${supplierId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          value: rating,
          comment: ratingComment,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Rating and review submitted successfully",
        });
        setRating(0);
        setRatingComment("");
        fetchRates(); // Refresh rates
        // Refresh supplier data to get updated rating
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to submit rating and review",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit rating and review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadSupplierData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSupplierDetail(supplierId, materialPage, machineryPage);
        console.log("fetchSupplierDetail",data)
        setSupplierData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load supplier data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (supplierId) {
      loadSupplierData();
      fetchRates();
    }
  }, [supplierId, materialPage, machineryPage]);

  useEffect(() => {
    if (materialId) {
      setHighlightedRowId(materialId);
      const timer = setTimeout(() => {
        setHighlightedRowId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [materialId]);

  const shareUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const loadMoreMaterials = async () => {
    if (!supplierData?.material_prices.next || loadingMoreMaterials) return;
    
    setLoadingMoreMaterials(true);
    try {
      const nextPage = materialPage + 1;
      const data = await fetchSupplierDetail(supplierId, nextPage, machineryPage);
      
      // Backend now returns cumulative data, so we replace the entire results
      setSupplierData(prev => ({
        ...prev!,
        material_prices: data.material_prices
      }));
      setMaterialPage(nextPage);
    } catch (err) {
      console.error('Error loading more materials:', err);
    } finally {
      setLoadingMoreMaterials(false);
    }
  };

  const loadMoreMachinery = async () => {
    if (!supplierData?.machinery_prices.next || loadingMoreMachinery) return;
    
    setLoadingMoreMachinery(true);
    try {
      const nextPage = machineryPage + 1;
      const data = await fetchSupplierDetail(supplierId, materialPage, nextPage);
      
      // Backend now returns cumulative data, so we replace the entire results
      setSupplierData(prev => ({
        ...prev!,
        machinery_prices: data.machinery_prices
      }));
      setMachineryPage(nextPage);
    } catch (err) {
      console.error('Error loading more machinery:', err);
    } finally {
      setLoadingMoreMachinery(false);
    }
  };

  const loadLessMaterials = async () => {
    if (materialPage <= 1 || loadingMoreMaterials) return;
    
    setLoadingMoreMaterials(true);
    try {
      const prevPage = materialPage - 1;
      const data = await fetchSupplierDetail(supplierId, prevPage, machineryPage);
      
      // Backend now returns cumulative data, so we replace the entire results
      setSupplierData(prev => ({
        ...prev!,
        material_prices: data.material_prices
      }));
      setMaterialPage(prevPage);
    } catch (err) {
      console.error('Error loading less materials:', err);
    } finally {
      setLoadingMoreMaterials(false);
    }
  };

  const loadLessMachinery = async () => {
    if (machineryPage <= 1 || loadingMoreMachinery) return;
    
    setLoadingMoreMachinery(true);
    try {
      const prevPage = machineryPage - 1;
      const data = await fetchSupplierDetail(supplierId, materialPage, prevPage);
      
      // Backend now returns cumulative data, so we replace the entire results
      setSupplierData(prev => ({
        ...prev!,
        machinery_prices: data.machinery_prices
      }));
      setMachineryPage(prevPage);
    } catch (err) {
      console.error('Error loading less machinery:', err);
    } finally {
      setLoadingMoreMachinery(false);
    }
  };

  const loadMaterialsOnly = async () => {
    setMaterialsLoading(true);
    try {
      const data = await fetchSupplierDetail(supplierId, 1, machineryPage);
      setSupplierData(prev => ({
        ...prev!,
        material_prices: data.material_prices
      }));
      setMaterialPage(1);
    } catch (err) {
      console.error('Error loading materials:', err);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const loadMachineryOnly = async () => {
    setMachineryLoading(true);
    try {
      const data = await fetchSupplierDetail(supplierId, materialPage, 1);
      setSupplierData(prev => ({
        ...prev!,
        machinery_prices: data.machinery_prices
      }));
      setMachineryPage(1);
    } catch (err) {
      console.error('Error loading machinery:', err);
    } finally {
      setMachineryLoading(false);
    }
  };

  const getRegionName = (regionId: number): string => {
    const regionMap: { [key: number]: string } = {
      1: "Amhara",
      2: "Addis Ababa",
      3: "Afar",
    };
    return regionMap[regionId] || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading supplier details...</p>
        </div>
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

  if (!supplierData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Supplier not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const { supplier, material_prices } = supplierData;
  const visibleMaterials = material_prices.results;
  const totalPages = Math.ceil(material_prices.count / ITEMS_PER_PAGE);
  const hasMore = material_prices.next !== null;

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          GO BACK
        </Button>

        {/* Supplier Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
          <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5"></div>
          <div className="p-4 -mt-12 relative">
            <div className="bg-white rounded-lg shadow-lg p-4 border">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {supplier.user_details?.company_name}
                      </h1>
                      {supplier.is_active && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          Verified
                        </Badge>
                      )}
                      {supplier.manufacturer && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          Manufacturer
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {getRegionName(supplier.user_details.region)}
                      </div>
                      {supplier.user_details.established_year && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Est. {supplier.user_details.established_year}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={shareUrl}>
                    {copied ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Share2 className="h-4 w-4 mr-2" />
                    )}
                    {copied ? "Copied!" : "Share"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      (window.location.href = `tel:${supplier.phone_number}`)
                    }
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(`mailto:${supplier.email}`, "_blank");
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {supplier.user_details.description && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {supplier.user_details.description}
                  </p>
                </CardContent>
              </Card>
            )}

            

            {/* Documents */}
            {supplier.documents.length > 0 && (
              <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                {supplier.documents.length > 0 ? (
                  <div className="space-y-6">
                    {supplier.documents.map((doc) => (
                      <div key={doc.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <img
                          src={doc.file}
                          alt={doc.file_type}
                          className="w-32 h-32 object-cover rounded-md mb-2"
                        />
                        <p className="font-medium">{doc.file_type}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No documents listed.</p>
                )}
              </CardContent>
            </Card>
            )}

            {/* Materials Table - Only show if materials exist */}
            {material_prices.results.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Available Materials ({material_prices.results.length} of {material_prices.count})
                    {materialsLoading && (
                      <Building2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Material
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">
                          Price
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">
                          Date
                        </th>
                        
                      </tr>
                    </thead>
                    <tbody>
                      {visibleMaterials.map((material, index) => (
                        <motion.tr
                          key={material.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            backgroundColor:
                              highlightedRowId === material.material
                                ? "#fef3c7"
                                : "transparent",
                          }}
                          transition={{
                            delay: index * 0.1,
                            backgroundColor: { duration: 2, ease: "easeOut" },
                          }}
                          className={`border-b hover:bg-gray-50 transition-colors ${
                            highlightedRowId === material.material
                              ? "ring-2 ring-yellow-400 ring-opacity-50"
                              : ""
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {material.material_name}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="font-medium text-gray-900">
                               {parseFloat(material.price).toLocaleString()} ETB
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="text-sm text-gray-600">
                              {new Date(
                                material.price_date
                              ).toLocaleDateString()}
                            </div>
                          </td>
                          
                        
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Load More/Less Materials */}
                <div className="mt-4 flex justify-center gap-3">
                  {materialPage > 1 && (
                    <Button
                      variant="outline"
                      onClick={loadLessMaterials}
                      disabled={loadingMoreMaterials || materialsLoading}
                      className="min-w-[120px]"
                    >
                      {loadingMoreMaterials ? (
                        <>
                          <Building2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load Less Materials'
                      )}
                    </Button>
                  )}
                  {material_prices.next && (
                    <Button
                      variant="outline"
                      onClick={loadMoreMaterials}
                      disabled={loadingMoreMaterials || materialsLoading}
                      className="min-w-[120px]"
                    >
                      {loadingMoreMaterials ? (
                        <>
                          <Building2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading More...
                        </>
                      ) : (
                        'Load More Materials'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Machineries Table */}
            {supplierData.machinery_prices?.results &&
              supplierData.machinery_prices.results.length > 0 && (
                <Card className="mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Available Machineries ({supplierData.machinery_prices.results.length} of {supplierData.machinery_prices.count})
                      {machineryLoading && (
                        <Award className="h-4 w-4 animate-spin text-primary" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">
                              Machinery
                            </th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">
                              Category
                            </th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">
                              Price
                            </th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">
                              Condition
                            </th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">
                              Type
                            </th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {supplierData.machinery_prices.results.map(
                            (machinery, index) => (
                              <motion.tr
                                key={machinery.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="border-b hover:bg-gray-50 transition-colors"
                              >
                                <td className="py-4 px-4">
                                  <div className="font-medium text-gray-900">
                                    {machinery.name}
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <div className="text-sm text-gray-600">
                                    {machinery.category}
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <div className="font-medium text-gray-900">
                                    ETB{" "}
                                    {parseFloat(
                                      machinery.price
                                    ).toLocaleString()}
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <Badge
                                    variant="secondary"
                                    className={
                                      machinery.condition === "New"
                                        ? "bg-green-100 text-green-800"
                                        : machinery.condition ===
                                          "Slightly Used"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    }
                                  >
                                    {machinery.condition}
                                  </Badge>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <Badge
                                    variant="secondary"
                                    className={
                                      machinery.type === "Sale"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-purple-100 text-purple-800"
                                    }
                                  >
                                    {machinery.type}
                                  </Badge>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <div className="text-sm text-gray-600">
                                    {new Date(
                                      machinery.price_date
                                    ).toLocaleDateString()}
                                  </div>
                                </td>
                              </motion.tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Load More/Less Machinery */}
                    <div className="mt-4 flex justify-center gap-3">
                      {machineryPage > 1 && (
                        <Button
                          variant="outline"
                          onClick={loadLessMachinery}
                          disabled={loadingMoreMachinery || machineryLoading}
                          className="min-w-[120px]"
                        >
                          {loadingMoreMachinery ? (
                            <>
                              <Award className="h-4 w-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Load Less Machinery'
                          )}
                        </Button>
                      )}
                      {supplierData.machinery_prices.next && (
                        <Button
                          variant="outline"
                          onClick={loadMoreMachinery}
                          disabled={loadingMoreMachinery || machineryLoading}
                          className="min-w-[120px]"
                        >
                          {loadingMoreMachinery ? (
                            <>
                              <Award className="h-4 w-4 mr-2 animate-spin" />
                              Loading More...
                            </>
                          ) : (
                            'Load More Machinery'
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-start sm:items-center gap-3">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">Address</p>
                    <p className="text-gray-600 text-xs sm:text-sm break-words">
                      {supplier.user_details.company_address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">Phone</p>
                    <p className="text-gray-600 text-xs sm:text-sm break-all">
                      {supplier.phone_number}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">Email</p>
                    <p className="text-gray-600 text-xs sm:text-sm break-all">
                      {supplier.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">Contact Person</p>
                    <p className="text-gray-600 text-xs sm:text-sm break-words">
                      {supplier.user_details.contact_person}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">Total Materials</span>
                  <span className="font-medium text-sm sm:text-base">{material_prices.count}</span>
                </div>
                <div className="flex justify-between items-start sm:items-center">
                  <span className="text-gray-600 text-sm sm:text-base">Owner</span>
                  <span className="font-medium text-sm sm:text-base text-right break-words max-w-[60%]">
                    {supplier.first_name} {supplier.last_name}
                  </span>
                </div>
                {supplier.user_details.established_year && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Established</span>
                    <span className="font-medium text-sm sm:text-base">
                      {supplier.user_details.established_year}
                    </span>
                  </div>
                )}
                {supplier.user_details.contact_person_phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Contact Phone</span>
                    <span className="font-medium text-sm sm:text-base break-all">
                      {supplier.user_details.contact_person_phone}
                    </span>
                  </div>
                )}
                
                
              </CardContent>
            </Card>

            {/* Rating and Review Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Rate & Review This Supplier
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rating" className="text-sm sm:text-base">Your Rating</Label>
                  <Rating
                    value={rating}
                    onChange={setRating}
                    size="lg"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="rating-comment" className="text-sm sm:text-base">Your Review</Label>
                  <Textarea
                    id="rating-comment"
                    placeholder="Share your detailed experience with this supplier..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleRatingSubmit}
                  disabled={isSubmitting || rating === 0 || !ratingComment.trim()}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Submit Rating & Review
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              Ratings & Reviews ({rates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rates.length > 0 ? (
              <div className="space-y-6">
                {rates.map((rate) => (
                  <div key={rate.id} className="border-b last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {rate.rated_by_first_name} {rate.rated_by_last_name}
                          </h4>
                          <Rating value={rate.value} readonly size="sm" />
                          <span className="text-sm text-gray-500">
                            {new Date(rate.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {rate.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No ratings and reviews yet. Be the first to rate and review this supplier!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fixed Ads Section */}
      <div className="hidden xl:block w-80 flex-shrink-0">
        <AdsSection
          title="Sponsored Deals"
          adType=""
          display_location="ad_sections"
          isFixed={true}
        />
      </div>
    </div>
  );
}
