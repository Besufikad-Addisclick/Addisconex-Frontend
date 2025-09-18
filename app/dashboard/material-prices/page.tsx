"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Save, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { Supplier, Category } from "@/app/types/supplier";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface Material {
  id: string;
  name: string;
  specification: string;
  unit: string;
  lastPrice: number;
  priceDate: string;
  remark?: string;
}
interface MaterialPrice {
  id: string;
  material: string;
  supplier: string;
  price: string;
  price_date: string;
  name: string;
  specification: string;
  unit: string;
}

// interface Category {
//   id: string;
//   name: string;
//   materials: Array<{ id: string; name: string }>;
// }

interface NewMaterialForm {
  category: string;
  material: string;
  price: string;
  remark: string;
}

interface FormErrors {
  category?: string;
  material?: string;
  price?: string;
  remark?: string;
}

interface Materials {
  id: string;
  name: string;
  category: number;
  specification: string;
  unit: string;
  price: number;
  price_date: string;
}

function PricesPage() {
  const { toast } = useToast();
  // const { user } = useAuth();
  const router = useRouter();
  const [supplierMaterials, setSupplierMaterials] = useState<Material[]>([]);
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [prices, setPrices] = useState<{ [key: string]: string }>({});
  const [priceErrors, setPriceErrors] = useState<{ [key: string]: string }>({});
  const [useLastPrice, setUseLastPrice] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState<NewMaterialForm>({
    category: "",
    material: "",
    price: "",
    remark: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]); // Store original suppliers
  const [filteredMaterials, setFilteredMaterials] = useState<Materials[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [userID, setUserID] = useState("");
  const [materialSearchQuery, setMaterialSearchQuery] = useState<string>("");

  // Set user type, supplier ID, and fetch suppliers/categories for admins
  useEffect(() => {
    const initializeData = async () => {
      try {
        const session = await getSession();
        console.log("Session user type:", session?.user?.userType);
        if (!session) return;

        const userType = session?.user?.userType as "admin" | "supplier";
        setUserRole(userType);
        const userId = session?.user?.id as string;
        setUserID(userId);
        setLoading(true);

        if (userType === "admin") {
          const response = await fetch(`/api/suppliers`, {
            method: "GET",
            credentials: "include",
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error ||
                `Failed to fetch machineries: ${response.status}`
            );
          }

          const data = await response.json();
          console.log("res", data);

          setAllSuppliers(data.suppliers); // Store original suppliers
          setFilteredMaterials(data.materials);

          // Transform categories to include materials from filteredMaterials
          const categoriesWithMaterials = data.categories.map(
            (cat: { id: any; name: any }) => ({
              id: cat.id,
              name: cat.name,
              materials: data.materials
                .filter((m: { category: any }) => m.category === cat.name)
                .map((m: { id: any; name: any }) => ({
                  id: m.id,
                  name: m.name,
                })),
            })
          );
          setCategories(categoriesWithMaterials);
        } else {
          setSelectedSupplier(userId);
          const response = await fetch(`/api/suppliers/${userId}`, {
            method: "GET",
            credentials: "include",
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || `Failed to fetch materials: ${response.status}`
            );
          }

          const data = await response.json();
          console.log("[PricesPage] Fetched supplier data:", data);

          // Map material prices to supplierMaterials
          const mappedMaterials = (data.material_prices || []).map((m: any) => {
            console.log(`[PricesPage] Mapping material price: ${m.id}`);
            return {
              id: m.id,
              name: m.name || m.material?.name || "Unknown",
              specification: m.specification || m.material?.specification || "",
              unit: m.unit || m.material?.unit || "",
              lastPrice: parseFloat(m.price) || 0,
              priceDate: m.price_date || "",
              remark: m.remark || "",
            };
          });
          setSupplierMaterials(mappedMaterials);
          console.log("[PricesPage] Mapped materials:", mappedMaterials);

          // Set initial prices, useLastPrice, and remarks
          setPrices(
            mappedMaterials.reduce(
              (acc: { [key: string]: string }, material: any) => ({
                ...acc,
                [material.id]: "",
              }),
              {}
            )
          );
          setUseLastPrice(
            mappedMaterials.reduce(
              (acc: { [key: string]: boolean }, material: any) => ({
                ...acc,
                [material.id]: false,
              }),
              {}
            )
          );
          setRemarks(
            mappedMaterials.reduce(
              (acc: { [key: string]: string }, material: any) => ({
                ...acc,
                [material.id]: material.remark || "",
              }),
              {}
            )
          );

          // Filter unpriced materials
          const pricedMaterialIds = new Set(
            (data.material_prices || []).map((mp: any) => mp.material.id)
          );
          const unpricedMaterials = data.materials.filter(
            (m: { id: string }) => !pricedMaterialIds.has(m.id)
          );
          setFilteredMaterials(unpricedMaterials);
          console.log("[PricesPage] Unpriced materials:", unpricedMaterials);

          // Transform categories to include unpriced materials
          const categoriesWithMaterials = data.categories.map(
            (cat: { id: number; name: string }) => ({
              id: cat.id,
              name: cat.name,
              materials: unpricedMaterials
                .filter((m: { category: number }) => m.category === cat.id) // Use cat.id
                .map((m: { id: string; name: string }) => ({
                  id: m.id,
                  name: m.name,
                })),
            })
          );
          setCategories(categoriesWithMaterials);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        toast({
          title: "Error",
          description: "Failed to load initial data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [toast, router]);

  // Derive filtered suppliers using useMemo
  const filteredSuppliers = useMemo(() => {
    if (userRole !== "admin") return allSuppliers;
    return allSuppliers.filter((supplier) =>
      supplier.user_details
        ? supplier?.user_details?.company_name
        : supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allSuppliers, userRole]);

  // Fetch material prices based on selectedSupplier

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const session = await getSession();
        console.log("Session user type:", session?.user?.userType);
        if (!session) return;

        const userType = session?.user?.userType as "admin" | "supplier";
        setUserRole(userType);
        const userId = session?.user?.id as string;
        setUserID(userId);
        setLoading(true);

        const response = await fetch(`/api/suppliers/${selectedSupplier}`, {
          method: "GET",
          credentials: "include",
        });
        console.log(`[PricesPage] Response status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error(
            `[PricesPage] Fetch error: ${
              errorData.error || response.statusText
            }`
          );
          throw new Error(
            errorData.error || `Failed to fetch: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("[PricesPage] Fetched data:", data);

        const mappedMaterials = (data.material_prices || []).map((m: any) => {
          console.log(`[PricesPage] Mapping material price: ${m.id}`);
          return {
            id: m.id,
            name: m.name || m.material?.name || "Unknown",
            specification: m.specification || m.material?.specification || "",
            unit: m.unit || m.material?.unit || "",
            lastPrice: parseFloat(m.price) || 0,
            priceDate: m.price_date || "",
            remark: m.remark || "",
          };
        });
        console.log("[PricesPage] Mapped materials:", mappedMaterials);

        setSupplierMaterials(mappedMaterials);
        setPrices(
          mappedMaterials.reduce(
            (acc: { [key: string]: string }, material: any) => ({
              ...acc,
              [material.id]: "",
            }),
            {}
          )
        );
        setUseLastPrice(
          mappedMaterials.reduce(
            (acc: { [key: string]: boolean }, material: any) => ({
              ...acc,
              [material.id]: false,
            }),
            {}
          )
        );
        setRemarks(
          mappedMaterials.reduce(
            (acc: { [key: string]: string }, material: any) => ({
              ...acc,
              [material.id]: material.remark || "",
            }),
            {}
          )
        );
        if (userType != "admin") {
          // Transform categories to include materials from filteredMaterials
          const categoriesWithMaterials = data.categories.map(
            (cat: { id: any; name: any }) => ({
              id: cat.id,
              name: cat.name,
              materials: data.materials
                .filter((m: { category: any }) => m.category === cat.name)
                .map((m: { id: any; name: any }) => ({
                  id: m.id,
                  name: m.name,
                })),
            })
          );
          setCategories(categoriesWithMaterials);
          const pricedMaterialIds = new Set(
            (data.material_prices || []).map((mp: any) => mp.material.id)
          );
          const unpricedMaterials = data.materials.filter(
            (m: { id: string }) => !pricedMaterialIds.has(m.id)
          );

          setFilteredMaterials(unpricedMaterials);
          console.log("[PricesPage] Unpriced materials:", unpricedMaterials);
        }
      } catch (error: any) {
        console.error(
          `[PricesPage] Error fetching materials for supplier ${selectedSupplier}:`,
          error.message
        );
        toast({
          title: "Error",
          description: error.message || "Failed to load material prices",
          variant: "destructive",
        });
        setSupplierMaterials([]);
      } finally {
        console.log("[PricesPage] Setting loading to false");
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [selectedSupplier, toast, router]);

  const handlePriceChange = (materialId: string, value: string) => {
    // Limit to 8 digits
    if (value.length > 9) {
      return;
    }
    
    setPrices((prev) => ({
      ...prev,
      [materialId]: value,
    }));
    setPriceErrors((prev) => ({
      ...prev,
      [materialId]: "",
    }));
    setUseLastPrice((prev) => ({
      ...prev,
      [materialId]: false,
    }));
  };

  const handleUseLastPriceChange = (materialId: string, checked: boolean) => {
    setUseLastPrice((prev) => ({
      ...prev,
      [materialId]: checked,
    }));
    if (checked) {
      const material = supplierMaterials.find((m) => m.id === materialId);
      if (material) {
        setPrices((prev) => ({
          ...prev,
          [materialId]: material.lastPrice.toString(),
        }));
        setPriceErrors((prev) => ({
          ...prev,
          [materialId]: "",
        }));
      }
    } else {
      setPrices((prev) => ({
        ...prev,
        [materialId]: "",
      }));
    }
  };

  const handleRemarkChange = (materialId: string, value: string) => {
    // Limit to 100 characters
    if (value.length > 100) {
      return;
    }
    
    setRemarks((prev) => ({
      ...prev,
      [materialId]: value,
    }));
  };

  // const validatePrices = () => {
  //   const errors: { [key: string]: string } = {};
  //   Object.entries(prices).forEach(([materialId, price]) => {
  //     if (!price) {
  //       errors[materialId] = "Price is required";
  //     } else {
  //       const numPrice = parseFloat(price);
  //       if (isNaN(numPrice) || numPrice <= 0) {
  //         errors[materialId] = "Invalid price";
  //       }
  //     }
  //   });
  //   setPriceErrors(errors);
  //   return Object.keys(errors).length === 0;
  // };
  const validatePrices = () => {
    const errors: { [key: string]: string } = {};
    let hasValidPrice = false;

    Object.entries(prices).forEach(([materialId, price]) => {
      if (price) {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice <= 0) {
          errors[materialId] = "Invalid price";
        } else if (price.length > 9) {
          errors[materialId] = "Price cannot exceed 9 digits";
        } else {
          hasValidPrice = true; // At least one valid price found
        }
      }
    });

    if (!hasValidPrice) {
      errors["noValidPrice"] = "At least one valid price must be entered";
    }

    setPriceErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplier) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier",
        variant: "destructive",
      });
      return;
    }

    if (!validatePrices()) {
      toast({
        title: "Validation Error",
        description: "At least one valid price must be entered",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("prices", prices);
      console.log("remarks", remarks);
      const pricedMaterials = Object.entries(prices).filter(([materialId, price]) => price !== "").reduce((acc, [materialId, price]) => ({ ...acc, [materialId]: price }), {})
      const remarkMaterials = Object.entries(remarks).filter(([materialId, remark]) => remark !== "").reduce((acc, [materialId, remark]) => ({ ...acc, [materialId]: remark }), {})
console.log("pricedMaterials",pricedMaterials)
console.log("remarkMaterials",remarkMaterials)
      const payload = {
        user_id: selectedSupplier,
        prices:pricedMaterials,
        remarks: remarkMaterials,
      };
      const response = await fetch(`/api/material-price/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(
          errorData.error ||
            `Failed to update material prices: ${response.status}`
        );
      }
      toast({
        title: "Success",
        description: "Material prices updated successfully!",
      });

      // console.log("supplierMaterials",supplierMaterials)
      // console.log("responseData",responseData)

      setPriceErrors({});
      const res = await fetch(`/api/suppliers/${selectedSupplier}`, {
        method: "GET",
        credentials: "include",
      });
      console.log(`[PricesPage] Response status: ${res.status}`);

      if (!res.ok) {
        const errorData = await res.json();
        console.error(
          `[PricesPage] Fetch error: ${errorData.error || res.statusText}`
        );
        throw new Error(errorData.error || `Failed to fetch: ${res.status}`);
      }

      const data = await res.json();
      const mappedMaterials = (data.material_prices || []).map((m: any) => {
        console.log(`[PricesPage] Mapping material price: ${m.id}`);
        return {
          id: m.id,
          name: m.name || m.material?.name || "Unknown",
          specification: m.specification || m.material?.specification || "",
          unit: m.unit || m.material?.unit || "",
          lastPrice: parseFloat(m.price) || 0,
          priceDate: m.price_date || "",
          remark: m.remark || "",
        };
      });
      console.log("[PricesPage] Mapped materials:", mappedMaterials);

      setSupplierMaterials(mappedMaterials);
      setPrices(
        mappedMaterials.reduce(
          (acc: { [key: string]: string }, material: any) => ({
            ...acc,
            [material.id]: "",
          }),
          {}
        )
      );
      setUseLastPrice(
        mappedMaterials.reduce(
          (acc: { [key: string]: boolean }, material: any) => ({
            ...acc,
            [material.id]: false,
          }),
          {}
        )
      );
      setRemarks(
        mappedMaterials.reduce(
          (acc: { [key: string]: string }, material: any) => ({
            ...acc,
            [material.id]: material.remark || "",
          }),
          {}
        )
      );
    } catch (error) {
      console.error("Error saving prices:", error);
      toast({
        title: "Error",
        description: "Failed to update material prices",
        variant: "destructive",
      });
    }
  };

  const validateNewMaterial = () => {
    const errors: FormErrors = {};
    if (!newMaterial.category) {
      errors.category = "Category is required";
    }
    if (!newMaterial.material) {
      errors.material = "Material is required";
    }
    if (!newMaterial.price) {
      errors.price = "Price is required";
    } else if (
      isNaN(parseFloat(newMaterial.price)) ||
      parseFloat(newMaterial.price) <= 0
    ) {
      errors.price = "Invalid price";
    } else if (newMaterial.price.length > 9) {
      errors.price = "Price cannot exceed 9 digits";
    }
    if (newMaterial.remark && newMaterial.remark.length > 100) {
      errors.remark = "Remark cannot exceed 100 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddNewMaterial = async () => {
    if (!selectedSupplier) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier",
        variant: "destructive",
      });
      return;
    }

    if (!validateNewMaterial()) {
      return;
    }

    try {
      const payload = {
        user_id: selectedSupplier,
        category: newMaterial.category,
        material: newMaterial.material,
        price: newMaterial.price,
        remark: newMaterial.remark,
      };

      const response = await fetch(`/api/suppliers/add-material`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(
          errorData.error ||
            `Failed to update material prices: ${response.status}`
        );
      }
      toast({
        title: "Success",
        description: "New material has been added successfully",
      });

      setNewMaterial({
        category: "",
        material: "",
        price: "",
        remark: "",
      });
      setFormErrors({});
      setIsDialogOpen(false);

      const res = await fetch(`/api/suppliers/${selectedSupplier}`, {
        method: "GET",
        credentials: "include",
      });
      console.log(`[PricesPage] Res status: ${res.status}`);

      if (!res.ok) {
        const errorData = await res.json();
        console.error(
          `[PricesPage] Fetch error: ${errorData.error || res.statusText}`
        );
        throw new Error(errorData.error || `Failed to fetch: ${res.status}`);
      }

      const data = await res.json();
      console.log("[PricesPage] Fetched data:", data);

      const mappedMaterials = (data.material_prices || []).map((m: any) => {
        console.log(`[PricesPage] Mapping material price: ${m.id}`);
        return {
          id: m.id,
          name: m.name || m.material?.name || "Unknown",
          specification: m.specification || m.material?.specification || "",
          unit: m.unit || m.material?.unit || "",
          lastPrice: parseFloat(m.price) || 0,
          priceDate: m.price_date || "",
          remark: m.remark || "",
        };
      });
      console.log("[PricesPage] Mapped materials:", mappedMaterials);

      setSupplierMaterials(mappedMaterials);
      setPrices(
        mappedMaterials.reduce(
          (acc: { [key: string]: string }, material: any) => ({
            ...acc,
            [material.id]: "",
          }),
          {}
        )
      );
      setUseLastPrice(
        mappedMaterials.reduce(
          (acc: { [key: string]: boolean }, material: any) => ({
            ...acc,
            [material.id]: false,
          }),
          {}
        )
      );
      setRemarks(
        mappedMaterials.reduce(
          (acc: { [key: string]: string }, material: any) => ({
            ...acc,
            [material.id]: material.remark || "",
          }),
          {}
        )
      );
    } catch (error) {
      // console.error("Error adding material:", error);
      toast({
        title: "Error",
        description: "Failed to add new material",
        variant: "destructive",
      });
    }
  };

  // Filter materials based on selected category ID
  // const availableMaterials = newMaterial.category
  //   ? filteredMaterials
  //       .filter((m) => m.category === Number(newMaterial.category))
  //       .map((m) => ({ id: m.id, name: m.name }))
  //   : [];
  const availableMaterials = useMemo(() => {
    const filteredByCategory = newMaterial.category
      ? filteredMaterials
          .filter((m) => m.category === Number(newMaterial.category))
          .map((m) => ({ id: m.id, name: m.name }))
      : [];
    if (!materialSearchQuery) return filteredByCategory;
    return filteredByCategory.filter((material) =>
      material.name.toLowerCase().includes(materialSearchQuery.toLowerCase())
    );
  }, [newMaterial.category, filteredMaterials, materialSearchQuery]);

  if (!userRole || loading) {
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
            <Save className="w-12 h-12 text-primary" />
          </motion.div>
          <p className="text-lg font-medium text-gray-700">Loading data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-6 sm:mb-8"
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">
          Update Material Prices
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">
          Manage your material prices and add new materials
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-lg shadow-sm p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
          {userRole && userRole === "admin" && (
            <div className="w-full sm:w-80">
              <Label
                htmlFor="supplier-select"
                className="text-sm font-medium text-gray-700"
              >
                Select Supplier
              </Label>
              <Select
                value={selectedSupplier}
                onValueChange={setSelectedSupplier}
              >
                <SelectTrigger
                  id="supplier-select"
                  className={selectedSupplier ? "" : "text-gray-500"}
                >
                  <SelectValue placeholder="Choose a supplier" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-2">
                    <Input
                      placeholder="Search suppliers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.user_details?.company_name} (
                        {supplier.phone_number}) ({supplier.email})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No suppliers found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex gap-2 sm:gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Add New Material</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-1">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newMaterial.category}
                      onValueChange={(value) => {
                        setNewMaterial((prev) => ({
                          ...prev,
                          category: value,
                          material: "",
                        }));
                        setFormErrors((prev) => ({ ...prev, category: "" }));
                      }}
                    >
                      <SelectTrigger
                        className={formErrors.category ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.category && (
                      <p className="text-sm text-red-500">
                        {formErrors.category}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="material">Material</Label>
                    <Select
                      value={newMaterial.material}
                      onValueChange={(value) => {
                        setNewMaterial((prev) => ({
                          ...prev,
                          material: value,
                        }));
                        setFormErrors((prev) => ({ ...prev, material: "" }));
                        setMaterialSearchQuery(""); // Reset search query on selection
                      }}
                      disabled={!newMaterial.category}
                    >
                      <SelectTrigger
                        id="material"
                        className={formErrors.material ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-2">
                          <Input
                            placeholder="Search materials..."
                            value={materialSearchQuery}
                            onChange={(e) =>
                              setMaterialSearchQuery(e.target.value)
                            }
                            className="w-full"
                            // prefix={
                            //   <Search className="h-4 w-4 text-gray-500" />
                            // }
                          />
                        </div>
                        {availableMaterials.length > 0 ? (
                          availableMaterials.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            No materials found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {formErrors.material && (
                      <p className="text-sm text-red-500">
                        {formErrors.material}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="price">Price (ETB)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newMaterial.price}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Limit to 8 digits
                        if (value.length > 9) {
                          return;
                        }
                        setNewMaterial((prev) => ({
                          ...prev,
                          price: value,
                        }));
                        setFormErrors((prev) => ({ ...prev, price: "" }));
                      }}
                      maxLength={9}
                      placeholder="Enter price"
                      className={formErrors.price ? "border-red-500" : ""}
                    />
                    {formErrors.price && (
                      <p className="text-sm text-red-500">{formErrors.price}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="remark">Remark (Optional)</Label>
                    <Textarea
                      id="remark"
                      value={newMaterial.remark}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Limit to 100 characters
                        if (value.length > 100) {
                          return;
                        }
                        setNewMaterial((prev) => ({
                          ...prev,
                          remark: value,
                        }));
                        setFormErrors((prev) => ({ ...prev, remark: "" }));
                      }}
                      placeholder="Enter any additional remarks..."
                      className={formErrors.remark ? "border-red-500" : ""}
                      rows={3}
                      maxLength={100}
                    />
                    <div className="flex justify-between items-center">
                      <div>
                        {formErrors.remark && (
                          <p className="text-sm text-red-500">{formErrors.remark}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {newMaterial.remark.length}/100
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddNewMaterial}>Add Material</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              onClick={handleSubmit}
              className="flex items-center gap-2"
              disabled={!selectedSupplier}
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {supplierMaterials.length === 0 ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <motion.div
              className="flex flex-col items-center gap-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                }}
              >
                <Save className="w-16 h-16 text-gray-500" />
              </motion.div>
              <p className="text-lg font-medium text-gray-700">
                No materials available
              </p>
              <p className="text-sm text-gray-500 max-w-md">
                {userRole && userRole === "admin"
                  ? "Select a supplier to view their materials or add a new material."
                  : "No materials found for your account. Add a new material to get started."}
              </p>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
                className="mt-2"
              >
                Add New Material
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600">
                    Material
                  </th>
                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600">
                    Last Price (ETB)
                  </th>
                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600 min-w-[200px]">
                    New Price (ETB)
                  </th>
                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600">
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody>
                {supplierMaterials.map((material) => (
                  <tr key={material.id} className="border-b border-gray-200">
                    <td className="p-2 sm:p-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {material.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {material.specification}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Unit: {material.unit}
                        </p>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {material.lastPrice.toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">
                          ({new Date(material.priceDate).toLocaleDateString()})
                        </span>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="space-y-1 w-full sm:max-w-[150px]">
                          <Input
                            type="number"
                            placeholder="Enter new price"
                            value={prices[material.id]}
                            onChange={(e) =>
                              handlePriceChange(material.id, e.target.value)
                            }
                            maxLength={9}
                            className={
                              priceErrors[material.id] ? "border-red-500" : ""
                            }
                          />
                          {priceErrors[material.id] && (
                            <p className="text-xs sm:text-sm text-red-500">
                              {priceErrors[material.id]}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`checkbox-${material.id}`}
                            checked={useLastPrice[material.id]}
                            onCheckedChange={(checked) =>
                              handleUseLastPriceChange(
                                material.id,
                                checked as boolean
                              )
                            }
                          />
                          <label
                            htmlFor={`checkbox-${material.id}`}
                            className="text-xs sm:text-sm font-medium leading-none"
                          >
                            Use last price
                          </label>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4">
                      <div className="max-w-[200px]">
                        <Textarea
                          value={remarks[material.id] || ""}
                          onChange={(e) => handleRemarkChange(material.id, e.target.value)}
                          placeholder="Enter remark..."
                          className="text-sm resize-none min-h-[60px]"
                          rows={2}
                          maxLength={100}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {(remarks[material.id] || "").length}/100
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function ProtectedPricesPage() {
  return (
    <ProtectedRoute>
      <PricesPage />
    </ProtectedRoute>
  );
}
