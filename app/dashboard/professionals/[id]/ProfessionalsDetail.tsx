/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Star,
  Users,
  Calendar,
  Award,
  Briefcase,
  CheckCircle2,
  ArrowLeft,
  User,
  Shield,
  Factory,
  FileText,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Subcontractor } from "@/app/types/subcontractor";
import { motion } from "framer-motion";




// Fallback image URL
const FALLBACK_IMAGE_URL =
  "/int.png";

export default function ProfessionalsDetail() {
  const router = useRouter();
  const params = useParams();
  const [subcontractor, setSubcontractor] = useState<Subcontractor | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubcontractor = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/professionals/${params.id}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Failed to fetch professionals: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Fetched professionals details:", data);

        const subcontractorData: Subcontractor = {
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          description:
            data.user_details.description || "No description available",
          companyAddress: data.user_details.company_address,
          category: data.user_details.category?.name || "Unknown",
          region:
            typeof data.user_details.regions === "object"
              ? data.user_details.regions.name
              : data.user_details.region || "Unknown",
          address: data.user_details.company_address || "N/A",
          rating: data.average_rate || null,
          completedProjects: data.key_projects?.length || 0,
          yearsOfExperience: data.user_details.established_year
            ? new Date().getFullYear() - data.user_details.established_year
            : 0,
          phone: data.phone_number || "N/A",
          email: data.email || "N/A",
          website: data.user_details.website || "N/A",
          specialization: data.user_details.equipment || [],
          certifications: (data.documents || []).filter(
            (doc: any) => doc.file_type.toLowerCase() == "certificate"
          ),
          keyProjects: (data.key_projects || []).map((project: any) => ({
            id: project.id,
            name: project.name,
            location: project.location,
            year: project.year,
            value: project.value,
            description: project.description,
            image: project.image,
            created_at: project.created_at,
            updated_at: project.updated_at,
          })),
          equipment: data.user_details.equipment || [],
          teamSize: data.user_details.team_size || 0,
          profile_picture: data.profile_picture || FALLBACK_IMAGE_URL,
          user_type: data.user_type || "Unknown",
          is_active: data.is_active ?? true,
          manufacturer: data.manufacturer ?? false,
          contact_person: data.user_details.contact_person || "N/A",
          documents: (data.documents || []).filter(
            (doc: any) => doc.file_type.toLowerCase() !== "certificate"
          ),
          imageUrl: "",
          user_details: data.user_details
        };

        console.log("Mapped key projects:", subcontractorData.keyProjects);
        setSubcontractor(subcontractorData);
      } catch (err: any) {
        console.error("Error fetching professionals:", err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchSubcontractor();
    }
  }, [params.id]);

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
            <Loader className="w-12 h-12 text-primary" />
          </motion.div>
          <p className="text-lg font-medium text-gray-700">
            Loading other professionals details...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !subcontractor) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              {error || "Failed to load professionals details."}
            </p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to professionals
            </Button>
            <Button variant="outline" className="mt-4 ml-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to professionals
      </Button>

      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
  <div className="p-6 -mt-16 relative flex flex-col md:flex-row items-start md:items-center gap-6">
    {/* Image on left (fixed width) */}
    <div className="w-full md:w-1/3 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
      <img
        src={subcontractor.profile_picture}
        alt={subcontractor.name}
        className="w-full h-full object-cover"
        style={{ minHeight: "200px" }} // adjust height as needed
      />
    </div>

    {/* Content on right */}
    <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{subcontractor.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{subcontractor.region || "N/A"}</Badge>
            <Badge variant="outline">{subcontractor.category}</Badge>
            <Badge variant="outline">{subcontractor.user_type}</Badge>
          
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href={`mailto:${subcontractor.email}`}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </a>
          </Button>
          <Button asChild>
            <a href={`tel:${subcontractor.phone}`}>
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </a>
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subcontractor.rating ? `${subcontractor.rating}/5.0` : "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projects Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subcontractor.completedProjects}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subcontractor.yearsOfExperience} Years
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{subcontractor.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {subcontractor.keyProjects.length > 0 ? (
                subcontractor.keyProjects.map((project) => (
                  <div key={project.id} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex gap-4">
                      <div className="flex-1">
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{project.year}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-600">{project.description}</p>
                        {project.value && <Badge variant="secondary" className="mt-2">{project.value}</Badge>}
                      </div>
                      <div className="w-32 h-24 flex-shrink-0">
                        <img
                          src={project.image || FALLBACK_IMAGE_URL}
                          alt={project.name}
                          className="w-full h-full object-cover rounded-md"
                          onLoad={() => console.log("Image loaded successfully:", project.image || FALLBACK_IMAGE_URL)}
                          onError={(e) => {
                            console.log("Image failed to load:", project.image || FALLBACK_IMAGE_URL);
                            const target = e.target as HTMLImageElement;
                            target.src = FALLBACK_IMAGE_URL;
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No projects listed.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              {subcontractor.documents.length > 0 ? (
                <div className="space-y-6">
                  {subcontractor.documents.map((doc) => (
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
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">
                    {subcontractor.address},{subcontractor.region}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">{subcontractor.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">{subcontractor.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Website</p>
                  <p className="text-gray-600">
                    <a
                      href={subcontractor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {subcontractor.website}
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Contact Person</p>
                  <p className="text-gray-600">
                    {subcontractor.contact_person}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subcontractor.user_details?.age && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Age</p>
                    <p className="text-gray-600">{subcontractor.user_details.age}</p>
                  </div>
                </div>
              )}
              
              {subcontractor.user_details?.employment_status && (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Employment Status</p>
                    <p className="text-gray-600">{subcontractor.user_details.employment_status}</p>
                  </div>
                </div>
              )}
              {subcontractor.user_details?.gender && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Gender</p>
                    <p className="text-gray-600">{subcontractor.user_details.gender}</p>
                  </div>
                </div>
              )}
              {subcontractor.user_details?.languages && subcontractor.user_details.languages.length > 0 && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Languages</p>
                    <p className="text-gray-600">{Array.isArray(subcontractor.user_details.languages) 
                      ? subcontractor.user_details.languages.join(", ") 
                      : subcontractor.user_details.languages}</p>
                  </div>
                </div>
              )}
              {subcontractor.user_details?.skills && subcontractor.user_details.skills.length > 0 && (
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Skills</p>
                    <p className="text-gray-600">{Array.isArray(subcontractor.user_details.skills) 
                      ? subcontractor.user_details.skills.join(", ") 
                      : subcontractor.user_details.skills}</p>
                  </div>
                </div>
              )}
              {subcontractor.user_details?.job_type && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Job Type</p>
                    <p className="text-gray-600">{subcontractor.user_details.job_type}</p>
                  </div>
                </div>
              )}
              {subcontractor.user_details?.highest_qualification && (
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Highest Qualification</p>
                    <p className="text-gray-600">{subcontractor.user_details.highest_qualification}</p>
                  </div>
                </div>
              )}
              {subcontractor.user_details?.marital_status && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Marital Status</p>
                    <p className="text-gray-600">{subcontractor.user_details.marital_status}</p>
                  </div>
                </div>
              )}
              {subcontractor.user_details?.references && (
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">References</p>
                    <p className="text-gray-600">{subcontractor.user_details.references}</p>
                  </div>
                </div>
              )}
              {(subcontractor.user_details?.salary_min || subcontractor.user_details?.salary_max) && (
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Salary Range</p>
                    <p className="text-gray-600">
                      {subcontractor.user_details.salary_min && subcontractor.user_details.salary_max
                        ? `${subcontractor.user_details.salary_min} - ${subcontractor.user_details.salary_max}`
                        : subcontractor.user_details.salary_min || subcontractor.user_details.salary_max}
                      {subcontractor.user_details.salary_negotiable && " (Negotiable)"}
                    </p>
                    </div>
                    </div>
              )}
            </CardContent>
          </Card>

         
        </div>
      </div>
    </div>
  );
}
