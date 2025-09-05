/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Save, Plus, Search, Edit, Trash2 } from "lucide-react";
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
import { useRouter } from "next/navigation";
import {
  Supplier,
  Category,
  Machinery,
  MachineryPrice,
} from "@/app/types/supplier";
import { getSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";

interface NewMaterialForm {
  category: string;
  machinery: string;
  price: string;
  image_file: File | null;
  type: string;
  location: string;
  year: string;
  condition: string;
  rental_duration: string;
  specification: string; // Object for key-value pairs
  status: "available" | "sold" | "rented" | "pending" | "archived";
}

interface EditMaterialForm {
  id: string;
  category: string;
  machinery: string;
  price: string;
  image_file: File | null;
  image_url: string; // For existing image in edit mode
  type: string;
  location: string;
  year: string;
  condition: string;
  rental_duration: string;
  specification: string | null; // Object for key-value pairs
  status: "available" | "sold" | "rented" | "pending" | "archived";
}

interface FormErrors {
  category?: string;
  machinery?: string;
  price?: string;
  image_file?: string;
  type?: string;
  location?: string;
  year?: string;
  condition?: string;
  rental_duration?: string;
  specification?: string;
  status?: string;
}

export default function MachineriesPrice() {
  const { toast } = useToast();
  const router = useRouter();
  const [supplierMaterials, setSupplierMaterials] = useState<MachineryPrice[]>(
    []
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState<NewMaterialForm>({
    category: "",
    machinery: "",
    price: "",
    image_file: null,
    type: "",
    location: "",
    year: "",
    condition: "",
    rental_duration: "hour",
    specification: "", // Initialize as empty object
    status: "available",
  });
  const [editMaterial, setEditMaterial] = useState<EditMaterialForm | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]); // Store original suppliers
  const [filteredMachineries, setFilteredMachineries] = useState<Machinery[]>(
    []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [userID, setUserID] = useState("");

  // Set user type, supplier ID, and fetch suppliers/categories for admins
  useEffect(() => {
    const initializeData = async () => {
      const session = await getSession();
      if (!session) return;
      const userType = session?.user?.userType as "admin" | "supplier";
      setUserRole(userType);
      const userId = session?.user?.id as string;
      setUserID(userId);
      try {
        setLoading(true);

        if (userType === "admin") {
          const response = await fetch(
            `/api/machineries/supplier-machineries`,
            {
              method: "GET",
              credentials: "include",
            }
          );
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
          const pricedMaterialIds = new Set(
            (data.machinery_prices || []).map((mp: any) => mp.machinery.id)
          );

          const unpricedMaterials = data.machineries.filter(
            (m: { id: string }) => !pricedMaterialIds.has(m.id)
          );
          console.log("pricedMaterialIds", pricedMaterialIds);
          console.log("unpricedMaterials", unpricedMaterials);
          setFilteredMachineries(unpricedMaterials);

          // Transform categories to include materials from
          const categoriesWithMaterials = data.categories.map(
            (cat: { id: any; name: any }) => ({
              id: cat.id,
              name: cat.name,
              materials: data?.machineries
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
          const response = await fetch(
            `/api/machineries/supplier-machineries/${userId}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || `Failed to fetch materials: ${response.status}`
            );
          }

          const data = await response.json();
          console.log(
            "[PricesPage] Fetched supplier data :",
            data.machinery_prices
          );

          // Map material prices
          const mappedMaterials = (data.machinery_prices || []).map(
            (m: any) => {
              return {
                id: m.id,
                machinery: m.machinery || [],
                type: m.type || "",
                year: m.year || "",
                location: m.location || "",
                image_url: m.image_url || "/int.png",
                condition: m.condition || "",
                rental_duration: m.rental_duration || "",
                price: parseFloat(m.price) || 0,
                price_date: m.price_date || "",
                specification: m.specification || null,
                status: m.status || "available",
              };
            }
          );
          setSupplierMaterials(mappedMaterials);
          console.log("[PricesPage] Mapped materials:", mappedMaterials);

          // Filter unpriced materials
          const pricedMaterialIds = new Set(
            (data.machinery_prices || []).map((mp: any) => mp.machinery.id)
          );
          const unpricedMaterials = data.machineries.filter(
            (m: { id: string }) => !pricedMaterialIds.has(m.id)
          );
          console.log("pricedMaterialIds", pricedMaterialIds);
          console.log("unpricedMaterials", unpricedMaterials);
          setFilteredMachineries(unpricedMaterials);
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
        ? supplier.user_details.company_name
        : supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allSuppliers, userRole]);

  // Fetch material prices based on selectedSupplier

  useEffect(() => {
    fetchMachineries();
  }, [selectedSupplier, toast, router]);

  const fetchMachineries = async () => {
    const session = await getSession();
    if (!session) return;

    const userType = session?.user?.userType as "admin" | "supplier";
    setUserRole(userType);
    const userId = session?.user?.id as string;
    setUserID(userId);
    try {
      setLoading(true);
      const response = await fetch(
        `/api/machineries/supplier-machineries/${selectedSupplier}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      // console.log(`[PricesPage] Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          `[PricesPage] Fetch error: ${errorData.error || response.statusText}`
        );
        throw new Error(
          errorData.error || `Failed to fetch: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("[PricesPage] Fetched data:", data);

      const mappedMaterials = (data.machinery_prices || []).map((m: any) => {
        return {
          id: m.id,
          machinery: m.machinery || [],
          type: m.type || "",
          year: m.year || "",
          location: m.location || "",
          image_url: m.image_url || "/int.png",
          condition: m.condition || "",
          rental_duration: m.rental_duration || "",
          price: parseFloat(m.price) || 0,
          price_date: m.price_date || "",
          specification: m.specification || null,
          status: m.status || "available",
        };
      });
      console.log("[PricesPage] Mapped materials:", mappedMaterials);

      setSupplierMaterials(mappedMaterials);

      if (userType != "admin") {
        // Transform categories to include materials from
        const categoriesWithMachineries = data.categories.map(
          (cat: { id: any; name: any }) => ({
            id: cat.id,
            name: cat.name,
            materials: data.machineries
              .filter((m: { category: any }) => m.category === cat.name)
              .map((m: { id: any; name: any }) => ({
                id: m.id,
                name: m.name,
              })),
          })
        );
        setCategories(categoriesWithMachineries);
        const pricedMaterialIds = new Set(
          (data.machinery_prices || []).map((mp: any) => mp.machinery.id)
        );
        const unpricedMaterials = data.machineries.filter(
          (m: { id: string }) => !pricedMaterialIds.has(m.id)
        );
        console.log("pricedMaterialIds", pricedMaterialIds);
        console.log("unpricedMaterials", unpricedMaterials);
        setFilteredMachineries(unpricedMaterials);
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

  useEffect(() => {
    if (editMaterial && editMaterial.image_url) {
      setImagePreview(editMaterial.image_url);
    }
  }, [editMaterial]);

  const validateNewMaterial = (form: NewMaterialForm | EditMaterialForm) => {
    const errors: FormErrors = {};
    if (!form.category) {
      errors.category = "Category is required";
    }
    if (!form.machinery) {
      errors.machinery = "Machinery is required";
    }
    if (!form.price) {
      errors.price = "Price is required";
    } else if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      errors.price = "Invalid price";
    }
    // if (!form.image_file && !("image_url" in form && form.image_url)) {
    //   errors.image_file = "Image is required";
    // }
    if (!form.type) {
      errors.type = "Type is required";
    }
    if (!form.location) {
      errors.location = "Location is required";
    }
    if (!form.year) {
      errors.year = "Year is required";
    } else if (isNaN(parseInt(form.year)) || parseInt(form.year) < 1900) {
      errors.year = "Invalid year";
    }
    if (!form.condition) {
      errors.condition = "Condition is required";
    }
    if (form.type === "rent" && !form.rental_duration) {
      errors.rental_duration = "Rental duration is required for rentals";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle image file change for both add and edit forms
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      if (isEdit && editMaterial) {
        setEditMaterial({ ...editMaterial, image_file: file });
        setFormErrors((prev) => ({ ...prev, image_file: "" }));
      } else {
        setNewMaterial((prev) => ({ ...prev, image_file: file }));
        setFormErrors((prev) => ({ ...prev, image_file: "" }));
      }
    }
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

    if (!validateNewMaterial(newMaterial)) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user_id", selectedSupplier);
      formData.append("category", newMaterial.category);
      formData.append("machinery", newMaterial.machinery);
      formData.append("price", newMaterial.price);
      if (newMaterial.image_file) {
        formData.append("image_file", newMaterial.image_file);
      }
      formData.append("type", newMaterial.type);
      formData.append("location", newMaterial.location);
      formData.append("year", newMaterial.year);
      formData.append("condition", newMaterial.condition);
      formData.append("rental_duration", newMaterial.rental_duration);
      formData.append("specification", newMaterial.specification || "");
      formData.append("status", newMaterial.status);
      console.log("newMaterial", newMaterial);
      console.log("formData", formData);

      const response = await fetch(`/api/machineries/add-machineries`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(
          errorData.error || `Failed to add machinery: ${response.status}`
        );
      }
      toast({
        title: "Success",
        description: "New machinery has been added successfully",
      });

      setNewMaterial({
        category: "",
        machinery: "",
        price: "",
        image_file: null,
        type: "",
        location: "",
        year: "",
        condition: "",
        rental_duration: "hour",
        specification: "",
        status: "available",
      });
      setImagePreview(null);
      setFormErrors({});
      setIsDialogOpen(false);
      fetchMachineries();
    } catch (error) {
      console.error("Error adding material:", error);
      toast({
        title: "Error",
        description: "Failed to add new machinery",
        variant: "destructive",
      });
    }
  };

  // Handle edit machinery
  const handleEditMaterial = async () => {
    if (!selectedSupplier || !editMaterial) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier and machinery to edit",
        variant: "destructive",
      });
      return;
    }

    if (!validateNewMaterial(editMaterial)) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user_id", selectedSupplier);
      formData.append("category", editMaterial.category);
      formData.append("machinery", editMaterial.machinery);
      formData.append("price", editMaterial.price);
      if (editMaterial.image_file) {
        formData.append("image_file", editMaterial.image_file);
      }
      formData.append("type", editMaterial.type);
      formData.append("location", editMaterial.location);
      formData.append("year", editMaterial.year);
      formData.append("condition", editMaterial.condition);
      formData.append("rental_duration", editMaterial.rental_duration);
      formData.append("specification", editMaterial.specification || "");
      formData.append("status", editMaterial.status);
      

      const response = await fetch(
        `/api/machineries/add-machineries/${editMaterial.id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(
          errorData.error || `Failed to update machinery: ${response.status}`
        );
      }
      toast({
        title: "Success",
        description: "Machinery has been updated successfully",
      });

      setEditMaterial(null);
      setImagePreview(null);
      setFormErrors({});
      setIsEditDialogOpen(false);
      fetchMachineries();
    } catch (error) {
      console.error("Error updating material:", error);
      toast({
        title: "Error",
        description: "Failed to update machinery",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!selectedSupplier) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/machineries/add-machineries/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(
          errorData.error || `Failed to delete machinery: ${response.status}`
        );
      }
      toast({
        title: "Success",
        description: "Machinery has been deleted successfully",
      });

      fetchMachineries();
    } catch (error) {
      console.error("Error deleting material:", error);
      toast({
        title: "Error",
        description: "Failed to delete machinery",
        variant: "destructive",
      });
    }
  };

  // Filter materials based on selected category ID
  const availableMaterials = newMaterial.category
    ? filteredMachineries
        .filter((m) => m.category === newMaterial.category)
        .map((m) => ({ id: m.id, name: m.name }))
    : [];

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
          Update Machineries Prices
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">
          Manage your Machineries prices and add new materials
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-lg shadow-sm p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
          {userRole === "admin" && (
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
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={!selectedSupplier}
                >
                  <Plus className="h-4 w-4" />
                  Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Machinery</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newMaterial.category}
                        onValueChange={(value) => {
                          setNewMaterial((prev) => ({
                            ...prev,
                            category: value,
                            machinery: "",
                          }));
                          setFormErrors((prev) => ({ ...prev, category: "" }));
                        }}
                      >
                        <SelectTrigger
                          className={
                            formErrors.category ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={String(category.name)}
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
                      <Label htmlFor="machinery">Machinery</Label>
                      <Select
                        value={newMaterial.machinery}
                        onValueChange={(value) => {
                          setNewMaterial((prev) => ({
                            ...prev,
                            machinery: value,
                          }));
                          setFormErrors((prev) => ({ ...prev, machinery: "" }));
                        }}
                        disabled={!newMaterial.category}
                      >
                        <SelectTrigger
                          className={
                            formErrors.machinery ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select machinery" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMaterials.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.machinery && (
                        <p className="text-sm text-red-500">
                          {formErrors.machinery}
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
                          setNewMaterial((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }));
                          setFormErrors((prev) => ({ ...prev, price: "" }));
                        }}
                        placeholder="Enter price"
                        className={formErrors.price ? "border-red-500" : ""}
                      />
                      {formErrors.price && (
                        <p className="text-sm text-red-500">
                          {formErrors.price}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="image_file">Image</Label>
                      <Input
                        id="image_file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, false)}
                        className={
                          formErrors.image_file ? "border-red-500" : ""
                        }
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <Image
                            src={imagePreview}
                            alt="AddisConX"
                            width={100}
                            height={100}
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      {formErrors.image_file && (
                        <p className="text-sm text-red-500">
                          {formErrors.image_file}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={newMaterial.type}
                        onValueChange={(value) => {
                          setNewMaterial((prev) => ({ ...prev, type: value }));
                          setFormErrors((prev) => ({ ...prev, type: "" }));
                        }}
                      >
                        <SelectTrigger
                          className={formErrors.type ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sale">Sale</SelectItem>
                          <SelectItem value="rent">Rent</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.type && (
                        <p className="text-sm text-red-500">
                          {formErrors.type}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        type="text"
                        value={newMaterial.location}
                        onChange={(e) => {
                          setNewMaterial((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }));
                          setFormErrors((prev) => ({ ...prev, location: "" }));
                        }}
                        placeholder="Enter location"
                        className={formErrors.location ? "border-red-500" : ""}
                      />
                      {formErrors.location && (
                        <p className="text-sm text-red-500">
                          {formErrors.location}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={newMaterial.year}
                        onChange={(e) => {
                          setNewMaterial((prev) => ({
                            ...prev,
                            year: e.target.value,
                          }));
                          setFormErrors((prev) => ({ ...prev, year: "" }));
                        }}
                        placeholder="Enter year"
                        className={formErrors.year ? "border-red-500" : ""}
                      />
                      {formErrors.year && (
                        <p className="text-sm text-red-500">
                          {formErrors.year}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="condition">Condition</Label>
                      <Select
                        value={newMaterial.condition}
                        onValueChange={(value) => {
                          setNewMaterial((prev) => ({
                            ...prev,
                            condition: value,
                          }));
                          setFormErrors((prev) => ({ ...prev, condition: "" }));
                        }}
                      >
                        <SelectTrigger
                          className={
                            formErrors.condition ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="slightly used">
                            Slightly Used
                          </SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.condition && (
                        <p className="text-sm text-red-500">
                          {formErrors.condition}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="rental_duration">Rental Duration</Label>
                      <Select
                        value={newMaterial.rental_duration}
                        onValueChange={(value) => {
                          setNewMaterial((prev) => ({
                            ...prev,
                            rental_duration: value,
                          }));
                          setFormErrors((prev) => ({
                            ...prev,
                            rental_duration: "",
                          }));
                        }}
                        disabled={newMaterial.type !== "rent"} // disable if type is not rent
                      >
                        <SelectTrigger
                          id="rental_duration"
                          className={
                            formErrors.rental_duration ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hour">Per Hour</SelectItem>
                          <SelectItem value="day">Per Day</SelectItem>
                          <SelectItem value="week">Per Week</SelectItem>
                          <SelectItem value="month">Per Month</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.rental_duration && (
                        <p className="text-sm text-red-500">
                          {formErrors.rental_duration}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={editMaterial?.status || "available"}
                        onValueChange={(value) => {
                          setEditMaterial((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  status: value as EditMaterialForm["status"],
                                }
                              : prev
                          );
                          setFormErrors((prev) => ({ ...prev, status: "" }));
                        }}
                      >
                        <SelectTrigger
                          className={formErrors.status ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="rented">Rented</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.status && (
                        <p className="text-sm text-red-500">
                          {formErrors.status}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="specification">Specification</Label>
                      <Textarea
                        id="specification"
                        value={newMaterial.specification}
                        onChange={(e) => {
                          setNewMaterial((prev) => ({
                            ...prev,
                            specification: e.target.value,
                          }));
                          setFormErrors((prev) => ({
                            ...prev,
                            specification: "",
                          }));
                        }}
                        placeholder="Enter detailed specification..."
                        className={
                          formErrors.specification ? "border-red-500" : ""
                        }
                      />
                      {formErrors.specification && (
                        <p className="text-sm text-red-500">
                          {formErrors.specification}
                        </p>
                      )}
                    </div>

                    
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleAddNewMaterial}>
                      Add Machinery
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-[90vw] sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Machinery</DialogTitle>
                </DialogHeader>
                {editMaterial && (
                  <div className="py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={editMaterial.category}
                          onValueChange={(value) => {
                            setEditMaterial((prev) =>
                              prev
                                ? { ...prev, category: value, machinery: "" }
                                : prev
                            );
                            setFormErrors((prev) => ({
                              ...prev,
                              category: "",
                            }));
                          }}
                        >
                          <SelectTrigger
                            className={
                              formErrors.category ? "border-red-500" : ""
                            }
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={String(category.name)}
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
                        <Label htmlFor="machinery">Machinery</Label>
                        <Select
                          value={editMaterial.machinery}
                          onValueChange={(value) => {
                            setEditMaterial((prev) =>
                              prev ? { ...prev, machinery: value } : prev
                            );
                            setFormErrors((prev) => ({
                              ...prev,
                              machinery: "",
                            }));
                          }}
                          disabled={!editMaterial.category}
                        >
                          <SelectTrigger
                            className={
                              formErrors.machinery ? "border-red-500" : ""
                            }
                          >
                            <SelectValue placeholder="Select machinery" />
                          </SelectTrigger>
                          <SelectContent>
                            {editMaterial.category
                              ? filteredMachineries
                                  .filter(
                                    (m) => m.category === editMaterial.category
                                  )
                                  .map((m) => (
                                    <SelectItem key={m.id} value={m.id}>
                                      {m.name}
                                    </SelectItem>
                                  ))
                              : []}
                          </SelectContent>
                        </Select>
                        {formErrors.machinery && (
                          <p className="text-sm text-red-500">
                            {formErrors.machinery}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="price">Price (ETB)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={editMaterial.price}
                          onChange={(e) => {
                            setEditMaterial((prev) =>
                              prev ? { ...prev, price: e.target.value } : prev
                            );
                            setFormErrors((prev) => ({ ...prev, price: "" }));
                          }}
                          placeholder="Enter price"
                          className={formErrors.price ? "border-red-500" : ""}
                        />
                        {formErrors.price && (
                          <p className="text-sm text-red-500">
                            {formErrors.price}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="image_file">Image</Label>
                        <Input
                          id="image_file"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, true)}
                          className={
                            formErrors.image_file ? "border-red-500" : ""
                          }
                        />
                        {imagePreview && (
                          <div className="mt-2">
                            <Image
                              src={imagePreview}
                              alt="AddisConX"
                              width={50}
                              height={50}
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        {formErrors.image_file && (
                          <p className="text-sm text-red-500">
                            {formErrors.image_file}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={editMaterial.type}
                          onValueChange={(value) => {
                            setEditMaterial((prev) =>
                              prev ? { ...prev, type: value } : prev
                            );
                            setFormErrors((prev) => ({ ...prev, type: "" }));
                          }}
                        >
                          <SelectTrigger
                            className={formErrors.type ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sale">Sale</SelectItem>
                            <SelectItem value="rent">Rent</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.type && (
                          <p className="text-sm text-red-500">
                            {formErrors.type}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          type="text"
                          value={editMaterial.location}
                          onChange={(e) => {
                            setEditMaterial((prev) =>
                              prev
                                ? { ...prev, location: e.target.value }
                                : prev
                            );
                            setFormErrors((prev) => ({
                              ...prev,
                              location: "",
                            }));
                          }}
                          placeholder="Enter location"
                          className={
                            formErrors.location ? "border-red-500" : ""
                          }
                        />
                        {formErrors.location && (
                          <p className="text-sm text-red-500">
                            {formErrors.location}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          type="number"
                          value={editMaterial.year}
                          onChange={(e) => {
                            setEditMaterial((prev) =>
                              prev ? { ...prev, year: e.target.value } : prev
                            );
                            setFormErrors((prev) => ({ ...prev, year: "" }));
                          }}
                          placeholder="Enter year"
                          className={formErrors.year ? "border-red-500" : ""}
                        />
                        {formErrors.year && (
                          <p className="text-sm text-red-500">
                            {formErrors.year}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="condition">Condition</Label>
                        <Select
                          value={editMaterial.condition}
                          onValueChange={(value) => {
                            setEditMaterial((prev) =>
                              prev ? { ...prev, condition: value } : prev
                            );
                            setFormErrors((prev) => ({
                              ...prev,
                              condition: "",
                            }));
                          }}
                        >
                          <SelectTrigger
                            className={
                              formErrors.condition ? "border-red-500" : ""
                            }
                          >
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="slightly used">
                              Slightly Used
                            </SelectItem>
                            <SelectItem value="used">Used</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.condition && (
                          <p className="text-sm text-red-500">
                            {formErrors.condition}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="rental_duration">Rental Duration</Label>
                        <Select
                          value={editMaterial?.rental_duration || ""}
                          onValueChange={(value) => {
                            if (editMaterial) {
                              setEditMaterial({
                                ...editMaterial,
                                rental_duration: value,
                              });
                            }
                            setFormErrors((prev) => ({
                              ...prev,
                              rental_duration: "",
                            }));
                          }}
                          disabled={editMaterial?.type !== "rent"}
                        >
                          <SelectTrigger
                            id="rental_duration"
                            className={
                              formErrors.rental_duration ? "border-red-500" : ""
                            }
                          >
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hour">Per Hour</SelectItem>
                            <SelectItem value="day">Per Day</SelectItem>
                            <SelectItem value="week">Per Week</SelectItem>
                            <SelectItem value="month">Per Month</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.rental_duration && (
                          <p className="text-sm text-red-500">
                            {formErrors.rental_duration}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={editMaterial.status}
                          onValueChange={(value) => {
                            setEditMaterial((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    status: value as EditMaterialForm["status"],
                                  }
                                : prev
                            );
                            setFormErrors((prev) => ({ ...prev, status: "" }));
                          }}
                        >
                          <SelectTrigger
                            className={
                              formErrors.status ? "border-red-500" : ""
                            }
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                            <SelectItem value="rented">Rented</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.status && (
                          <p className="text-sm text-red-500">
                            {formErrors.status}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="specification">Specification</Label>
                        <Textarea
                          id="specification"
                          value={editMaterial.specification || ""}
                          onChange={(e) => {
                            setEditMaterial((prev) =>
                              prev
                                ? { ...prev, specification: e.target.value }
                                : prev
                            );
                            setFormErrors((prev) => ({
                              ...prev,
                              specification: "",
                            }));
                          }}
                          placeholder="Enter detailed specification..."
                          className={
                            formErrors.specification ? "border-red-500" : ""
                          }
                        />
                        {formErrors.specification && (
                          <p className="text-sm text-red-500">
                            {formErrors.specification}
                          </p>
                        )}
                      </div>

                      
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button onClick={handleEditMaterial}>
                        Update Machinery
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
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
                No machineries available
              </p>
              <p className="text-sm text-gray-500 max-w-md">
                {userRole === "admin"
                  ? "Select a supplier to view their machineries or add a new machineries."
                  : "No machineries found for your account. Add a new machineries to get started."}
              </p>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
                className="mt-2"
              >
                Add New Machineries
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-200">
                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600 min-w-[200px]">
                    Image
                  </th>
                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600">
                    Material
                  </th>
                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600">
                    Price (ETB)
                  </th>
                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600">
                    Rental Duration
                  </th>

                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600">
                    Type
                  </th>
                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600">
                    Location
                  </th>
                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600">
                    Year
                  </th>
                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600">
                    Condition
                  </th>
                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600">
                   Specification
                  </th>
                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {supplierMaterials.map((machineryPrice) => (
                  <tr
                    key={machineryPrice.id}
                    className="border-b border-gray-200"
                  >
                    <td className="p-2 sm:p-4">
                      <div className="relative w-20 h-10 rounded overflow-hidden">
                        {machineryPrice.image_url ? (
                          <Image
                            src={machineryPrice.image_url }
                            alt={machineryPrice.machinery.name}
                            fill
                            className="object-cover"
                          />
                        ) : machineryPrice.machinery.imageUrl ? (
                          <Image
                            src={machineryPrice.machinery.imageUrl}
                            alt={machineryPrice.machinery.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-gray-400 text-sm">No image</div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 sm:p-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {machineryPrice.machinery.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {machineryPrice.machinery.category}
                        </p>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {machineryPrice.price.toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">
                          (
                          {new Date(
                            machineryPrice.price_date
                          ).toLocaleDateString()}
                          )
                        </span>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 capitalize">
                      {machineryPrice.type === "rent"
                        ? machineryPrice.rental_duration || "hour"
                        : "-"}
                    </td>

                    <td className="p-2 sm:p-4 capitalize">
                      {machineryPrice.type}
                    </td>
                    <td className="p-2 sm:p-4">{machineryPrice.location}</td>
                    <td className="p-2 sm:p-4">{machineryPrice.year}</td>
                    <td className="p-2 sm:p-4 capitalize">
                      {machineryPrice.condition}
                    </td>
                    <td className="p-2 sm:p-4 capitalize">
                      {machineryPrice.specification}
                    </td>
                    <td className="p-2 sm:p-4 capitalize">
                      {machineryPrice.status}
                    </td>
                    <td className="p-2 sm:p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditMaterial({
                              id: machineryPrice.id,
                              category: machineryPrice.machinery.category || "",
                              machinery: machineryPrice.machinery.id || "",
                              price: machineryPrice.price.toString(),
                              image_url: machineryPrice.image_url || "",
                              image_file: null,
                              type: machineryPrice.type || "",
                              location: machineryPrice.location || "",
                              year: machineryPrice.year.toString() || "",
                              condition: machineryPrice.condition || "",
                              rental_duration:
                                machineryPrice.rental_duration || "",
                              specification: machineryPrice.specification || "",
                              status: machineryPrice.status || "available",
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this machinery?"
                              )
                            ) {
                              handleDeleteMaterial(machineryPrice.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
