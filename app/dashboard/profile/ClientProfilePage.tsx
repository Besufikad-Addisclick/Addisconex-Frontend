"use client";
import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  message,
  Modal,
  Upload,
  Card,
  Typography,
  Divider,
  Checkbox,
} from "antd";
import {
  UploadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  CalendarOutlined,
  TeamOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { User, Shield, Bell, CreditCard, Lock, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { handleApiError } from "@/app/utils/apiErrorHandler";
import { signOut } from "next-auth/react";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_type: string;
  is_active: boolean;
  manufacturer: boolean;
  profile_picture: string | null; // Added profile_picture
  user_details: {
    company_name: string;
    company_address: string;
    website: string | null;
    description: string | null;
    contact_person: string;
    contact_person_phone: string | null;
    region: number;
    established_year: number | null;
    team_size: number | null;
    equipment: any[];
    employment_status?: string | null;
    marital_status?: string | null;
    age?: number | null;
    job_type?: string | null;
    gender?: string | null;
    skills?: string[];
    highest_qualification?: string | null;
    languages?: string[];
    references?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    salary_negotiable?: boolean;
    year_of_experience?: number | null;
    grade?: string | null;
    category?: { id: string; name: string } | null;
  };
  key_projects: Array<{
    id: string;
    name: string;
    location: string;
    year: number;
    description: string;
    image?: string | null;
  }>;
  documents: Array<{
    id: string;
    file: string;
    file_type: string;
    issued_by: string | null;
    issued_date: string | null;
    expiry_date: string | null;
    is_active: boolean;
  }>;
  regions: Array<{
    id: number;
    name: string;
    note: string;
  }>;
  labor_categories: Array<{
    category_id: string;
    category_name: string;
    team_size: number;
  }>;
  categories: Array<{ id: string; name: string }>;
}

export default function ClientProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState<UserProfile["regions"]>([]);
  const [categories, setCategories] = useState<UserProfile["categories"]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Predefined options for languages and skills
  const languageOptions = [
    "Amharic",
    "Oromo",
    "Tigrigna",
    "Somali",
    "Afar",
    "Chinese",
    "English",
  ];
  const skillOptions = [
    "Project Management",
    "Civil Engineering",
    "Structural Design",
    "Electrical",
    "Plumbing",
    "Masonry",
    "Carpentry",
    "Welding",
    "Surveying",
    "Safety Officer",
    "Estimator",
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      const session = await getSession();
      // console.log("Session user type:", session?.user?.userType);
      setLoading(true);
      try {
        const response = await fetch(`/api/profile`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          const errorData = await response.json();

          // Handle 401 errors
          if (response.status === 401) {
            handleApiError({ status: 401, message: errorData.error }, router);
            return;
          }

          throw new Error(
            errorData.error ||
              `Failed to fetch subcontractor: ${response.status}`
          );
        }
        const data: UserProfile = await response.json();
        // console.log("Fetched user profile:", data);
        setUserProfile(data);
        setRegions(data.regions);
        setCategories((data as any).categories || []);

        // Populate form fields including profile_picture
        form.setFieldsValue({
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone_number,
          profilePicture: data.profile_picture
            ? [
                {
                  uid: "-1",
                  name:
                    data.profile_picture.split("/").pop() || "profile-picture",
                  status: "done",
                  url: data.profile_picture,
                },
              ]
            : [], // Initialize profile_picture
          companyName: data.user_details?.company_name,
          companyAddress: data.user_details?.company_address,
          website: data.user_details?.website,
          description: data.user_details?.description,
          contactPerson: data.user_details?.contact_person,
          contactPersonPhone: data.user_details?.contact_person_phone,
          region: data.user_details?.region,
          establishedYear: data.user_details?.established_year,
          teamSize: data.user_details?.team_size,
          equipment: data.user_details?.equipment || [],
          employmentStatus: data.user_details?.employment_status ?? null,
          maritalStatus: data.user_details?.marital_status ?? null,
          age: data.user_details?.age ?? null,
          jobType: data.user_details?.job_type ?? null,
          gender: data.user_details?.gender ?? null,
          skills: data.user_details?.skills || [],
          highestQualification:
            data.user_details?.highest_qualification ?? null,
          languages: data.user_details?.languages || [],
          references: data.user_details?.references ?? null,
          salaryMin: data.user_details?.salary_min ?? null,
          salaryMax: data.user_details?.salary_max ?? null,
          salaryNegotiable: data.user_details?.salary_negotiable ?? false,
          yearOfExperience: data.user_details?.year_of_experience ?? null,
          grade: data.user_details?.grade ?? null,
          category: data.user_details?.category?.id || undefined,
          keyProjects: (data.key_projects || []).map((proj: any) => ({
            ...proj,
            image: proj.image
              ? [
                  {
                    uid: proj.id || "-1",
                    name: proj.image.split("/").pop() || "project-image",
                    status: "done",
                    url: proj.image,
                  },
                ]
              : [], // Ensure image is an array
          })),
          laborCategories:
            (data.labor_categories || []).map((lc: any) => ({
              category_id: lc.category_id,
              team_size: lc.team_size ?? 0,
            })) || [],
          documents:
            data.documents?.map((doc) => ({
              ...doc,
              file: doc.file
                ? [
                    {
                      uid: doc.id,
                      name: doc.file.split("/").pop() || "document",
                      status: "done",
                      url: doc.file,
                    },
                  ]
                : [],
            })) ?? [],
        });
      } catch (err: any) {
        // console.error("Error fetching subcontractor:", err.message);
        if (
          err.message?.includes("401") ||
          err.message?.includes("Unauthorized")
        ) {
          handleApiError(err, router);
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [form]);

  const handleProfileSave = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("first_name", values.firstName);
      formData.append("last_name", values.lastName);
      formData.append("phone_number", values.phone);

      // Append profile_picture if a new file is uploaded
      if (
        values.profilePicture &&
        values.profilePicture.length > 0 &&
        values.profilePicture[0].originFileObj
      ) {
        formData.append(
          "profile_picture",
          values.profilePicture[0].originFileObj
        );
      }

      const userDetailsData = {
        company_name: values.companyName,
        company_address: values.companyAddress,
        website: values.website || null,
        description: values.description || null,
        contact_person: values.contactPerson,
        contact_person_phone: values.contactPersonPhone,
        region: values.region,
        established_year: values.establishedYear
          ? parseInt(values.establishedYear)
          : null,
        team_size: values.teamSize ? parseInt(values.teamSize) : null,
        equipment: values.equipment || [],
        employment_status: values.employmentStatus || null,
        marital_status: values.maritalStatus || null,
        age: values.age ? parseInt(values.age) : null,
        job_type: values.jobType || null,
        gender: values.gender || null,
        skills: values.skills || [],
        highest_qualification: values.highestQualification || null,
        languages: values.languages || [],
        references: values.references || null,
        salary_min: values.salaryMin ? parseFloat(values.salaryMin) : null,
        salary_max: values.salaryMax ? parseFloat(values.salaryMax) : null,
        salary_negotiable: values.salaryNegotiable || false,
        year_of_experience: values.yearOfExperience
          ? parseInt(values.yearOfExperience)
          : null,
        grade: values.grade || null,
        category: values.category || null,
      };

      formData.append("user_details", JSON.stringify(userDetailsData));

      // Prepare key projects without images
      const keyProjectsData = (values.keyProjects || []).map(
        (project: any, index: number) => ({
          id: project.id || undefined,
          name: project.name,
          location: project.location,
          year: parseInt(project.year),
          description: project.description,
        })
      );

      // Append image files for key projects
      (values.keyProjects || []).forEach((project: any, index: number) => {
        const fileList = project.image;
        if (fileList && fileList.length > 0 && fileList[0].originFileObj) {
          formData.append(
            `key_projects[${index}][image]`,
            fileList[0].originFileObj
          );
        }
      });

      // Prepare labor categories
      const laborCategoriesData = (values.laborCategories || []).map(
        (lc: any) => ({
          category_id: lc.category_id,
          team_size: lc.team_size ? parseInt(lc.team_size) : 0,
        })
      );

      formData.append("labor_categories", JSON.stringify(laborCategoriesData));
      formData.append("key_projects", JSON.stringify(keyProjectsData));

      const documentsData = (values.documents || []).map((doc: any) => ({
        id: doc.id || undefined,
        file_type: doc.file_type,
        issued_date: doc.issued_date || null,
        expiry_date: doc.expiry_date || null,
        issued_by: doc.issued_by || null,
      }));

      formData.append("documents", JSON.stringify(documentsData));

      // Append uploaded files for documents
      if (values.documents) {
        values.documents.forEach((doc: any, index: number) => {
          if (doc.file && doc.file.length > 0 && doc.file[0].originFileObj) {
            formData.append(
              `documents[${index}][file]`,
              doc.file[0].originFileObj
            );
          }
        });
      }
      // console.log("Submitting formData:", Array.from(formData.entries()));

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();
      if (!response.ok) {
        const error = await response.json();
        // Dynamic error handling
        if (response.status === 401) {
          handleApiError({ status: 401, message: error.detail }, router);
          return;
        }
        let errorMessage = "Failed to update profile";
        if (result.error) {
          if (typeof result.error === "object") {
            // Handle field-specific errors (e.g., website, description, region)
            const fieldErrors = Object.entries(result.error)
              .map(([field, errors]) => {
                // Convert field name to human-readable format
                const fieldName = field
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());
                // Join multiple errors for the same field
                const errorMessages = Array.isArray(errors)
                  ? errors.join(", ")
                  : errors;
                return `${fieldName}: ${errorMessages}`;
              })
              .join("; ");
            errorMessage = `Failed to update profile: ${fieldErrors}`;
          } else if (result.error.detail) {
            errorMessage = `Failed to update profile: ${result.error.detail}`;
          } else {
            errorMessage = `Failed to update profile: ${JSON.stringify(
              result.error
            )}`;
          }
        }
        throw new Error(errorMessage);
      }

      toast({
        title: "Success!",
        description: "Profile Updated successfully.",
      });

      if (result) {
        form.setFieldsValue({
          firstName: result.first_name,
          lastName: result.last_name,
          phone: result.phone_number,
          profilePicture: result.profile_picture
            ? [
                {
                  uid: "-1",
                  name:
                    result.profile_picture.split("/").pop() ||
                    "profile-picture",
                  status: "done",
                  url: result.profile_picture,
                },
              ]
            : [], // Update profile_picture
          companyName: result.user_details?.company_name,
          companyAddress: result.user_details?.company_address,
          website: result.user_details?.website,
          description: result.user_details?.description,
          contactPerson: result.user_details?.contact_person,
          contactPersonPhone: result.user_details?.contact_person_phone,
          region: result.user_details?.region,
          establishedYear: result.user_details?.established_year,
          teamSize: result.user_details?.team_size,
          equipment: result.user_details?.equipment || [],
          employmentStatus: result.user_details?.employment_status ?? null,
          maritalStatus: result.user_details?.marital_status ?? null,
          age: result.user_details?.age ?? null,
          jobType: result.user_details?.job_type ?? null,
          gender: result.user_details?.gender ?? null,
          skills: result.user_details?.skills || [],
          highestQualification:
            result.user_details?.highest_qualification ?? null,
          languages: result.user_details?.languages || [],
          references: result.user_details?.references ?? null,
          salaryMin: result.user_details?.salary_min ?? null,
          salaryMax: result.user_details?.salary_max ?? null,
          salaryNegotiable: result.user_details?.salary_negotiable ?? false,
          yearOfExperience: result.user_details?.year_of_experience ?? null,
          grade: result.user_details?.grade ?? null,
          category: result.user_details?.category?.id || undefined,
          keyProjects: (result.key_projects || []).map((proj: any) => ({
            ...proj,
            image: proj.image
              ? [
                  {
                    uid: proj.id || "-1",
                    name: proj.image.split("/").pop() || "project-image",
                    status: "done",
                    url: proj.image,
                  },
                ]
              : [], // Ensure image is an array
          })),
          laborCategories:
            (result.labor_categories || []).map((lc: any) => ({
              category_id: lc.category_id,
              team_size: lc.team_size ?? 0,
            })) || [],
          documents:
            result.documents?.map((doc: any) => ({
              ...doc,
              file: doc.file
                ? [
                    {
                      uid: doc.id,
                      name: doc.file.split("/").pop() || "document",
                      status: "done",
                      url: doc.file,
                    },
                  ]
                : [],
            })) || [],
        });
      }
    } catch (error: any) {
      // console.log("Error updating profile:", error);
      toast({
        title: "Error!",
        description: error.message || "Failed to update profile",
        variant: "destructive", // Use this if your toast component supports error styling
      });
    
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }) => {
    setLoading(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the formatted error message from the API
        const errorMessage = data.error || "Failed to change password";
        throw new Error(errorMessage);
      }

      // Show success message
      toast({
        title: "Success!",
        description: "Password changed successfully!",
        variant: "default", // Use this if your toast component supports error styling
      });
      
      // Sign out the user after a short delay
      setTimeout(async () => {
        await signOut({ redirect: false });
        router.push("/auth/login");
        router.refresh();
      }, 1500);
      
    } catch (error: any) {
      // console.error("Password change error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSecuritySettings = () => (
    <Card title="Security Settings" className="shadow-sm">
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={handlePasswordChange}
        className="max-w-md"
      >
        <Form.Item
          name="old_password"
          label="Current Password"
          rules={[
            { required: true, message: "Please enter your current password" },
          ]}
        >
          <Input.Password placeholder="Current password" />
        </Form.Item>
        <Form.Item
  name="new_password"
  label="New Password"
  rules={[
    { required: true, message: "Please enter a new password" },
    { min: 8, message: "Password must be at least 8 characters" },
    ({ getFieldValue }) => ({
      validator(_, value) {
        const oldPassword = getFieldValue('old_password');
        if (value && value === oldPassword) {
          return Promise.reject(
            new Error('New password must be different from current password')
          );
        }
        return Promise.resolve();
      },
    }),
  ]}
>
  <Input.Password placeholder="New password" />
</Form.Item>
        <Form.Item
          name="confirm_password"
          label="Confirm New Password"
          dependencies={["new_password"]}
          rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value)
                  return Promise.resolve();
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600"
          >
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const renderNotificationSettings = () => (
    <Card title="Notification Settings" className="shadow-sm">
      <Text type="secondary">Notification settings coming soon...</Text>
    </Card>
  );

  const renderPaymentSettings = () => (
    <Card title="Payment Settings" className="shadow-sm">
      <Text type="secondary">Payment settings coming soon...</Text>
    </Card>
  );

  const renderPrivacySettings = () => (
    <Card title="Privacy Settings" className="shadow-sm">
      <Text type="secondary">Privacy settings coming soon...</Text>
    </Card>
  );

  const renderProfileSettings = () => {
    const userRole = userProfile?.user_type ?? "custom_role";

    return (
      <Card title="Profile Information" className="shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleProfileSave}
          className="space-y-4"
        >
          {/* Basic User Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="profilePicture"
              label="Profile Picture"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) return e;
                return e && e.fileList ? e.fileList : [];
              }}
            >
              <Upload
                beforeUpload={() => false}
                accept=".jpg,.jpeg,.png,.gif"
                maxCount={1}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>
                  Upload Profile Picture
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="firstName"
              label="First Name"
              rules={[
                { required: true, message: "Please enter your first name" },
                {
                  max: 255,
                  message: "First name is too long",
                },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter first name" />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[
                { required: true, message: "Please enter your last name" },
                {
                  max: 255,
                  message: "Last name is too long",
                },
                ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter last name" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter a valid email",
                },
                {
                  max: 255,
                  message: "Email is too long",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                disabled
                placeholder="Email address"
              />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                { required: true, message: "Please enter your phone number" },
                {
                  pattern: /^\+?2519\d{8}$|09\d{8}$/,
                  message:
                    "Enter a valid Ethiopian phone number like +251912345678 or 0912345678",
                },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Phone number" />
            </Form.Item>
            <Form.Item
              name="region"
              label="Region"
              rules={[{ required: true, message: "Please select a region" }]}
            >
              <Select placeholder="Select a region" allowClear>
                {regions.map((region) => (
                  <Option key={region.id} value={region.id}>
                    {region.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {userRole == "contractors" && (
              <>
                <Form.Item name="grade" label="Grade">
                  <Select placeholder="Select grade" allowClear>
                    {[...Array(11)].map((_, index) => {
                      const gradeNumber = index + 1;
                      return (
                        <Option
                          key={gradeNumber}
                          value={`grade_${gradeNumber}`}
                        >
                          {`Grade ${gradeNumber}`}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </>
            )}
            {userRole !== "admin" && userRole !== "professionals" && (
                        <>
                        <Form.Item
                          name="category"
                          label="Area of Specialization"
                          rules={[
                            {
                              required:
                                userRole == "contractors" ||
                                userRole == "subcontractors",
                              message: "Please select an area of specialization",
                            },
                          ]}
                        >
                          <Select placeholder="Select category" allowClear>
                            {categories.map((cat) => (
                              <Option key={cat.id} value={cat.id}>
                                {cat.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        </>)}
          </div>
          {userRole !== "admin" && userRole !== "professionals" && (
            <>
              <Divider orientation="left">Company Information</Divider>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="companyName"
                  label="Company Name"
                  rules={[
                    {
                      required:
                        userRole !== "admin" && userRole !== "professionals",
                      message: "Please enter your company name",
                    },
                    {
                      max: 255,
                      message: "Address is too long",
                    },
                  ]}
                >
                  <Input prefix={<Building />} placeholder="Company name" />
                </Form.Item>
                <Form.Item
                  name="companyAddress"
                  label="Company Address"
                  rules={[
                    
                    {
                      required:
                        userRole !== "admin" && userRole !== "professionals",
                      message: "Please enter your company address",
                    },
                    {
                      max: 255,
                      message: "Address is too long",
                    },
                  ]}
                >
                  <Input placeholder="Enter company address" />
                </Form.Item>
                <Form.Item name="website" label="Website"
                rules={[
                  {
                    max: 200,
                    message: "Website URL is too long",
                  },
                  {
                    type: "url",
                    message:
                      "Please enter a valid URL (e.g., https://example.com)",
                  },
                ]}>
                  <Input
                    prefix={<GlobalOutlined />}
                    placeholder="https://example.com"
                  />
                </Form.Item>
                <Form.Item
                  name="contactPerson"
                  label="Contact Person"
                  rules={[
                    {
                      required:
                        userRole !== "admin" && userRole !== "professionals",
                      message: "Please enter a contact person",
                    },
                    {
                      max: 100,
                      message: "Contact person name is too long",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Contact person name"
                  />
                </Form.Item>
                <Form.Item
                  name="contactPersonPhone"
                  label="Contact Person  phone"
                  rules={[
                    {
                      required:
                        userRole !== "admin" && userRole !== "professionals",
                      message: "Please enter your phone number",
                    },
                    {
                      pattern: /^(?:\+2519|09|\+2517|07)\d{8}$/,
                      message: "Enter a valid Ethiopian phone number like +251912345678 or 0912345678",
                      
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="phone number"
                  />
                </Form.Item>
                <Form.Item name="establishedYear" label="Established Year"
                rules={[
                  
                  {
                    validator: (_, value) => {
                      if (
                        value &&
                        (value < 1900 || value > new Date().getFullYear())
                      ) {
                        return Promise.reject(
                          new Error(
                            `Year must be between 1900 and ${new Date().getFullYear()}`
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}>
                  <Input
                    type="number"
                    prefix={<CalendarOutlined />}
                    placeholder="Year"
                    maxLength={4}
                    
                  />
                </Form.Item>
                <Form.Item name="teamSize" label="Team Size">
                  <Input
                    type="number"
                    prefix={<TeamOutlined />}
                    placeholder="Number of employees"
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item name="description" label="Description">
                  <TextArea rows={2} placeholder="Describe your company..." />
                </Form.Item>
              </div>
            </>
          )}
          {userRole == "professionals" && (
            <>
              <Divider orientation="left">Additional Details</Divider>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item name="employmentStatus" label="Employment Status">
                  <Select placeholder="Select employment status" allowClear>
                    <Option value="full_time">Full Time</Option>
                    <Option value="part_time">Part Time</Option>
                    <Option value="self_employed">Self Employed</Option>
                    <Option value="freelance">Freelance</Option>
                    <Option value="unemployed">Unemployed</Option>
                    <Option value="student">Student</Option>
                    <Option value="retired">Retired</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="maritalStatus" label="Marital Status">
                  <Select placeholder="Select marital status" allowClear>
                    <Option value="single">Single</Option>
                    <Option value="married">Married</Option>
                    <Option value="divorced">Divorced</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="age" label="Age">
                  <Input type="number" min={0} placeholder="Enter age" />
                </Form.Item>

                <Form.Item name="jobType" label="Job Type">
                  <Select placeholder="Select job type" allowClear>
                    <Option value="permanent">Permanent</Option>
                    <Option value="temporary">Temporary</Option>
                    <Option value="contract">Contract</Option>
                    <Option value="internship">Internship</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="gender" label="Gender">
                  <Select placeholder="Select gender" allowClear>
                    <Option value="male">Male</Option>
                    <Option value="female">Female</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="skills" label="Skills">
                  <Select
                    mode="tags"
                    placeholder="Add skills"
                    tokenSeparators={[","]}
                    options={skillOptions.map((s) => ({ value: s, label: s }))}
                  />
                </Form.Item>

                <Form.Item
                  name="highestQualification"
                  label="Highest Qualification"
                >
                  <Select placeholder="Select qualification" allowClear>
                    <Option value="no_formal_education">
                      No Formal Education
                    </Option>
                    <Option value=" high_school">High School Diploma</Option>
                    <Option value="associate">Associate Degree</Option>
                    <Option value="bachelor">Bachelor&apos;s Degree</Option>
                    <Option value="master">Master&apos;s Degree</Option>
                    <Option value="phd">PhD</Option>
                    <Option value="professional">Professional Degree</Option>
                    <Option value="diploma">Diploma</Option>
                    <Option value="certificate">Certificate</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="languages" label="Languages">
                  <Select
                    mode="tags"
                    placeholder="Add languages"
                    tokenSeparators={[","]}
                    options={languageOptions.map((l) => ({
                      value: l,
                      label: l,
                    }))}
                  />
                </Form.Item>

                <Form.Item name="references" label="References">
                  <TextArea
                    rows={3}
                    placeholder="Enter references or additional info"
                  />
                </Form.Item>

                <Form.Item name="salaryMin" label="Minimum Salary"
                rules={[
                  {
                    max: 10,
                    message: "Salary should be 10 digits",
                  },
                ]}>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Minimum salary"
                    maxLength={10}
                  />
                </Form.Item>

                <Form.Item name="salaryMax" label="Maximum Salary"
                rules={[
                  {
                    max: 10,
                    message: "Salary should be 10 digits",
                  },
                ]}>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Maximum salary"
                    maxLength={10}
                  />
                </Form.Item>

                <Form.Item name="salaryNegotiable" valuePropName="checked">
                  <Checkbox>Salary Negotiable</Checkbox>
                </Form.Item>

                <Form.Item name="yearOfExperience" label="Years of Experience"
                >
                  <Input
                    type="number"
                    min={0}
                    placeholder="Years of experience"
                    maxLength={2}
                  />
                </Form.Item>
              </div>
            </>
          )}
          {(userRole == "contractors" || userRole == "subcontractors") && (
            <>
              <Divider orientation="left">Available Machineries</Divider>
              <Form.List name="equipment">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex gap-4 items-end mb-4">
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          label="Machinery Name"
                          className="flex-1"
                          rules={[
                            {
                              required: true,
                              message: "Please enter machinery name",
                            },
                            {
                              max: 255,
                              message: "Machinery name is too long",
                            },
                          ]}
                        >
                          <Input placeholder="machinery name" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "quantity"]}
                          label="Quantity"
                          className="w-32"
                          rules={[
                            {
                              required: true,
                              message: "Please enter quantity",
                            },
                            {
                              max: 10,
                              message: "Quantity should be 10 digits",
                            },
                          ]}
                        >
                          <Input type="number" placeholder="Qty" />
                        </Form.Item>

                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Machinery
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </>
          )}
          {userRole === "agencies" && (
            <>
              <Divider orientation="left">Labor Categories</Divider>
              <Form.List name="laborCategories">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex gap-4 items-end mb-4">
                        <Form.Item
                          {...restField}
                          name={[name, "category_id"]}
                          label="Category"
                          className="flex-1"
                          rules={[
                            {
                              required: true,
                              message: "Please select a category",
                            },
                            {
                              max: 255,
                              message: "Category is too long",
                            },
                          ]}
                        >
                          <Select placeholder="Select category">
                            {categories.map((cat) => (
                              <Option key={cat.id} value={cat.id}>
                                {cat.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "team_size"]}
                          label="Team Size"
                          className="w-32"
                          // rules={[
                          //   {
                          //     required: true,
                          //     message: "Please enter team size",
                          //   },
                          // ]}
                          rules={[
                            {
                              max: 10,
                              message: "Team size should be 10 digits",
                            },
                          ]}
                        >
                          <Input type="number" placeholder="Team size" />
                        </Form.Item>

                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Labor Category
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </>
          )}

          {userRole !== "suppliers" &&
            userRole !== "individuals" &&
            userRole !== "agencies" &&
            userRole !== "admin" && (
              <>
                <Divider orientation="left">Key Projects</Divider>
                <Form.List name="keyProjects">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => {
                        const currentProject =
                          userProfile?.key_projects?.[name];
                        return (
                          <Card
                            key={key}
                            className="mb-4 border-2 border-dashed border-gray-300"
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "id"]}
                              hidden
                            >
                              <Input type="hidden" />
                            </Form.Item>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Form.Item
                                {...restField}
                                name={[name, "name"]}
                                label="Project Name"
                                rules={[
                                  {
                                    required: true,
                                    message: "Please enter project name",
                                  },
                                  {
                                    max: 255,
                                    message: "Project name is too long",
                                  },
                                ]}
                              >
                                <Input placeholder="Project name" />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "location"]}
                                label="Location"
                                rules={[
                                  {
                                    required: true,
                                    message: "Please enter location",
                                  },
                                  {
                                    max: 255,
                                    message: "Location is too long",
                                  },
                                ]}
                              >
                                <Input placeholder="Project location" />
                              </Form.Item>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Form.Item
                                {...restField}
                                name={[name, "year"]}
                                label="Year"
                                rules={[
                                  {
                                    required: true,
                                    message: "Please enter year",
                                  },
                                  {
                                    max: 4,
                                    message: "Year should be 4 digits",
                                  },
                                    ]}
                              >
                                <Input type="number" placeholder="Year" maxLength={4} />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "description"]}
                                label="Description"
                                rules={[
                                  {
                                    required: true,
                                    message: "Please enter description",
                                  },
                                  {
                                    max: 1000,
                                    message: "Description is too long",
                                  },
                                ]}
                              >
                                <TextArea
                                  placeholder="Project description"
                                  rows={3}
                                />
                              </Form.Item>
                            </div>

                            <Form.Item
                              {...restField}
                              name={[name, "image"]}
                              label="Project Image"
                              valuePropName="fileList"
                              getValueFromEvent={(e) => {
                                if (Array.isArray(e)) return e;
                                return e && e.fileList ? e.fileList : [];
                              }}
                              
                            >
                              <Upload
                                beforeUpload={() => false}
                                accept=".jpg,.jpeg,.png,.gif"
                                maxCount={1}
                                defaultFileList={
                                  currentProject?.image
                                    ? [
                                        {
                                          uid: "-1",
                                          name:
                                            currentProject.image
                                              .split("/")
                                              .pop() || "image",
                                          status: "done",
                                          url: currentProject.image,
                                        },
                                      ]
                                    : []
                                }
                                listType="picture"
                              >
                                <Button icon={<UploadOutlined />}>
                                  Upload Image
                                </Button>
                              </Upload>
                            </Form.Item>

                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                            >
                              Remove Project
                            </Button>
                          </Card>
                        );
                      })}
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                        >
                          Add Key Project
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </>
            )}
          {userRole !== "individuals" && userRole !== "admin" && (
            <>
              <Divider orientation="left">Documents</Divider>

              <Form.List name="documents">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => {
                      const currentDoc = userProfile?.documents?.[name];
                      return (
                        <Card
                          key={key}
                          className="mb-4 border-2 border-dashed border-gray-300"
                        >
                          <Form.Item {...restField} name={[name, "id"]} hidden>
                            <Input type="hidden" />
                          </Form.Item>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                              {...restField}
                              name={[name, "file_type"]}
                              label="Document Type"
                              rules={[
                                {
                                  required: true,
                                  message: "Please select document type",
                                },
                                {
                                  max: 255,
                                  message: "Document type is too long",
                                },
                              ]}
                            >
                              <Select placeholder="Select document type">
                                <Option value="license">
                                  Business License(Trade License)
                                </Option>
                                
                                <Option value="grade_certificate">
                                  Grade Certificate
                                </Option>
                                <Option value="certificate">Certificate</Option>
                                <Option value="testimonials">
                                  Testimonials{" "}
                                </Option>
                                <Option value="awardsAndRecognitions">
                                  Awards & Recognitions
                                </Option>
                                <Option value="other">Other</Option>
                              </Select>
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "file"]}
                              label="File"
                              valuePropName="fileList"
                              getValueFromEvent={(e) => {
                                if (Array.isArray(e)) return e;
                                return e && e.fileList ? e.fileList : [];
                              }}
                              rules={[
                                {
                                  required: !currentDoc?.id,
                                  message: "Please upload a file",
                                },
                                
                              ]}
                            >
                              <Upload
                                beforeUpload={() => false}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                maxCount={1}
                                defaultFileList={
                                  currentDoc?.file
                                    ? [
                                        {
                                          uid: currentDoc.id,
                                          name:
                                            currentDoc.file.split("/").pop() ||
                                            "document",
                                          status: "done",
                                          url: currentDoc.file,
                                        },
                                      ]
                                    : []
                                }
                              >
                                <Button icon={<UploadOutlined />}>
                                  Upload File
                                </Button>
                              </Upload>
                            </Form.Item>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Form.Item
                              {...restField}
                              name={[name, "issued_date"]}
                              label="Issued Date"
                              rules={[
                                {
                                  max: 10,
                                  message: "Issued date should be 10 digits",
                                },
                              ]}
                            >
                              <Input type="date" maxLength={10} />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "expiry_date"]}
                              label="Expiry Date"
                              rules={[
                                {
                                  max: 10,
                                  message: "Expiry date should be 10 digits",
                                },
                              ]}
                            >
                              <Input type="date" maxLength={10} />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, "issued_by"]}
                              label="Issued By"
                              rules={[
                                {
                                  max: 255,
                                  message: "Issued by is too long",
                                },
                              ]}
                            >
                              <Input placeholder="Enter issuer" maxLength={255}         />
                            </Form.Item>
                          </div>

                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          >
                            Remove Document
                          </Button>
                        </Card>
                      );
                    })}

                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Document
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600"
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <Text type="danger">{error}</Text>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
  return (
    <div className="profile-skeleton">
    <div className="profile-header bg-gray-100 animate-pulse">
      <div className="profile-picture h-20 w-20 bg-gray-300 rounded-full" />
      <div className="profile-name h-6 w-40 bg-gray-300 rounded mb-2" />
    </div>
    <div className="profile-info bg-gray-100 animate-pulse">
      <div className="profile-bio h-12 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="profile-stats h-6 w-2/3 bg-gray-200 rounded mb-2" />
      <div className="profile-stats h-6 w-1/2 bg-gray-200 rounded mb-2" />
    </div>
    <div className="profile-tabs bg-gray-100 animate-pulse">
      <div className="tab h-10 w-32 bg-gray-300 rounded" />
      <div className="tab h-10 w-32 bg-gray-200 rounded" />
    </div>
  </div>
  );
}

  return (
    <div className="p-4 max-w-8xl mx-auto">
      <div className="mb-6">
        <Title level={2} className="text-gray-900 mb-2">
          Profile
        </Title>
        <Text type="secondary">
          Manage your account preferences and security settings
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="shadow-sm">
            <div className="space-y-1">
              {[
                {
                  key: "profile",
                  label: "Profile",
                  icon: <User className="w-4 h-4" />,
                },
                {
                  key: "security",
                  label: "Security",
                  icon: <Shield className="w-4 h-4" />,
                },
                {
                  key: "notifications",
                  label: "Notifications",
                  icon: <Bell className="w-4 h-4" />,
                },
                {
                  key: "payment",
                  label: "Payment",
                  icon: <CreditCard className="w-4 h-4" />,
                },
                {
                  key: "privacy",
                  label: "Privacy",
                  icon: <Lock className="w-4 h-4" />,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.key
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {activeTab === "profile" && renderProfileSettings()}
          {activeTab === "security" && renderSecuritySettings()}
          {activeTab === "notifications" && renderNotificationSettings()}
          {activeTab === "payment" && renderPaymentSettings()}
          {activeTab === "privacy" && renderPrivacySettings()}
        </div>
      </div>

      <Modal
        title="Delete Account"
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={() => setShowDeleteModal(false)}
          >
            Delete My Account
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <Text>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </Text>
          <Input placeholder="Type 'DELETE' to confirm" />
        </div>
      </Modal>
    </div>
  );
}
