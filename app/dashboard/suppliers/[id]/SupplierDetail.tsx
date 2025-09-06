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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AdsSection from "@/components/ads/AdsSection";
import { fetchSupplierDetail } from "./../../../services/materialService";
import { SupplierDetailResponse, Price } from "./../../../types/material";

const ITEMS_PER_PAGE = 5;

export default function SupplierDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierId = params.id as string;
  const materialId = searchParams.get("materialId");

  const [supplierData, setSupplierData] =
    useState<SupplierDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadSupplierData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSupplierDetail(supplierId, currentPage);
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
    }
  }, [supplierId, currentPage]);

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

            {/* Materials Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Available Materials ({material_prices.count})
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

                {/* Pagination */}
                {/* {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing {visibleMaterials.length} of{" "}
                      {material_prices.count} materials
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
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
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )} */}
              </CardContent>
            </Card>

            {/* Machineries Table */}
            {supplierData.machinery_prices?.results &&
              supplierData.machinery_prices.results.length > 0 && (
                <Card className="mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Available Machineries (
                      {supplierData.machinery_prices.count})
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
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-600 text-sm">
                      {supplier.user_details.company_address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">{supplier.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{supplier.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Contact Person</p>
                    <p className="text-gray-600">
                      {supplier.user_details.contact_person}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Materials</span>
                  <span className="font-medium">{material_prices.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact Person</span>
                  <span className="font-medium">
                    {supplier.user_details.contact_person}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <Badge
                    variant="secondary"
                    className={
                      supplier.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {supplier.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Type</span>
                  <Badge
                    variant="secondary"
                    className={
                      supplier.manufacturer
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {supplier.manufacturer ? "Manufacturer" : "Supplier"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
