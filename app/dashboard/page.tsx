"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Newspaper,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Briefcase,
  Wrench,
  FileText,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface AnalyticsData {
  // Backend returns snake_case
  total_users?: number;
  active_users?: number;
  new_users?: number;
  total_materials?: number;
  new_materials?: number;
  total_machineries?: number;
  new_machineries?: number;
  total_ads?: number;
  new_ads?: number;
  total_news?: number;
  new_news?: number;
  total_subscriptions?: number;
  active_subscriptions?: number;
  pending_subscriptions?: number;
  expired_subscriptions?: number;
  new_subscriptions?: number;
  total_projects?: number;
  new_projects?: number;
  total_subcontractors?: number;
  new_subcontractors?: number;
  total_professionals?: number;
  new_professionals?: number;
  total_agencies?: number;
  new_agencies?: number;
  average_rating?: number;
  total_ratings?: number;
  user_breakdown?: {
    suppliers: number;
    contractors: number;
    consultants: number;
    professionals: number;
  };
  recent_activity?: {
    recent_users: Array<{
      id: string;
      first_name: string;
      last_name: string;
      user_type: string;
      created_at: string;
    }>;
    recent_materials: Array<{
      id: string;
      name: string;
      created_at: string;
    }>;
  };
}

interface DashboardResponse {
  success: boolean;
  analytics: AnalyticsData | null;
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
  userType: string;
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = "blue",
  href 
}: {
  title: string;
  value: number;
  change?: number;
  icon: React.ElementType;
  color?: string;
  href?: string;
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };

  const content = (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-4 w-4" />
      </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {value.toLocaleString()}
            </div>
        {change !== undefined && (
          <div className="flex items-center text-xs">
            {change >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
              {Math.abs(change)} new in last 30 days
            </span>
      </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const fetchAnalytics = async () => {
    if (!session?.user) return;
    
      setLoading(true);
      setError(null);
    
    try {
      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end,
      });
      
      const response = await fetch(`/api/dashboard-analytics?${params}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data: DashboardResponse = await response.json();
      console.log(data);
      
      if (data.analytics) {
        setAnalytics(data.analytics);
      } else {
        setError('Analytics not available for your user type');
      }
      } catch (err: any) {
      setError(err.message);
      console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (session?.user) {
      fetchAnalytics();
    }
  }, [session, dateRange]);

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (status === "loading" || loading) {
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
            Loading Dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
  return (
      <div className="max-w-7xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchAnalytics}>
              Retry
            </Button>
          </CardContent>
        </Card>
              </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Analytics are not available for your user type.
            </p>
          </CardContent>
        </Card>
          </div>
    );
  }

  const userType = session?.user?.userType || 'unknown';
  const currentPackageName = session?.user?.currentPackageName;

  // Helper functions to check package access
  const hasPackageAccess = (allowedPackages: string[]) => {
    if (userType === 'admin') return true;
    return !!(currentPackageName && allowedPackages.includes(currentPackageName));
  };

  const canAccessMaterials = () => {
    if (userType === 'admin') return true;
    if (userType === 'suppliers') return false; // Suppliers don't access materials page
    return hasPackageAccess(['Essential', 'Pro', 'Premium', 'Consultant - Essential', 'Consultant - Pro', 'PRO']);
  };

  const canAccessMachineries = () => {
    if (userType === 'admin') return true;
    return hasPackageAccess(['Premium', 'Consultant - Pro', 'PRO']);
  };

  const canAccessSubcontractors = () => {
    if (userType === 'admin') return true;
    return hasPackageAccess(['Material Supplier - Pro', 'Machinery Supplier - Pro', 'Pro', 'Premium', 'Consultant - Pro', 'PRO']);
  };

  const canAccessConsultants = () => {
    if (userType === 'admin') return true;
    return hasPackageAccess(['Premium', 'Consultant - Pro', 'PRO']);
  };

  const canAccessAgencies = () => {
    if (userType === 'admin') return true;
    return hasPackageAccess(['Material Supplier - Pro', 'Machinery Supplier - Pro', 'Agency - Pro', 'Premium', 'Consultant - Pro', 'PRO']);
  };

  const canAccessProfessionals = () => {
    if (userType === 'admin') return true;
    if (userType === 'professionals') return true; // Professionals can always access their own page
    return hasPackageAccess(['Pro', 'Premium', 'Machinery Supplier - Pro', 'Consultant - Pro', 'PRO']);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
            Welcome back, {session?.user?.firstName || 'User'}! Here's your overview.
            </p>
          </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="start-date" className="text-sm">From:</Label>
            <Input
              id="start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="end-date" className="text-sm">To:</Label>
            <Input
              id="end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="w-40"
            />
        </div>
          <Button onClick={fetchAnalytics} variant="outline">
                   <Filter className="h-4 w-4 mr-2" />
            Apply
                 </Button>
          </div>
        </div>

      {/* User Type Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-sm">
          {userType.charAt(0).toUpperCase() + userType.slice(1)} Dashboard
        </Badge>
        <span className="text-sm text-gray-500">
          Last 30 days overview
                        </span>
                      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {userType === 'admin' && (
          <>
            <StatCard
              title="Total Users"
              value={analytics.total_users || 0}
              change={analytics.new_users}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Active Users"
              value={analytics.active_users || 0}
              icon={Activity}
              color="green"
            />
            <StatCard
              title="Total Materials"
              value={analytics.total_materials || 0}
              change={analytics.new_materials}
              icon={Package}
              color="purple"
              href="/dashboard/materials"
            />
            <StatCard
              title="Total Machineries"
              value={analytics.total_machineries || 0}
              change={analytics.new_machineries}
              icon={Wrench}
              color="orange"
              href="/dashboard/machineries"
            />
            
            <StatCard
              title="Total News"
              value={analytics.total_news || 0}
              change={analytics.new_news}
              icon={Newspaper}
              color="blue"
              href="/dashboard/news"
            />
            <StatCard
              title="Active Subscriptions"
              value={analytics.active_subscriptions || 0}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              title="Pending Subscriptions"
              value={analytics.pending_subscriptions || 0}
              icon={Activity}
              color="orange"
            />
            <StatCard
              title="Expired Subscriptions"
              value={analytics.expired_subscriptions || 0}
              icon={TrendingDown}
              color="red"
            />
            <StatCard
              title="Total Subscriptions"
              value={analytics.total_subscriptions || 0}
              change={analytics.new_subscriptions}
              icon={BarChart3}
              color="purple"
            />
          </>
        )}

        {userType === 'suppliers' && (
          <>
            <StatCard
              title="Total Materials"
              value={analytics.total_materials || 0}
              change={analytics.new_materials}
              icon={Package}
              color="blue"
              href="/dashboard/materials"
            />
            <StatCard
              title="Total Machineries"
              value={analytics.total_machineries || 0}
              change={analytics.new_machineries}
              icon={Wrench}
              color="green"
              href="/dashboard/machineries"
            />
            
          </>
        )}

        {userType === 'contractors' && (
          <>
            <StatCard
              title="Total Projects"
              value={analytics.total_projects || 0}
              change={analytics.new_projects}
              icon={Briefcase}
              color="blue"
              href="/dashboard/othercontractors"
            />
            {canAccessSubcontractors() && (
              <StatCard
                title="Subcontractors"
                value={analytics.total_subcontractors || 0}
                change={analytics.new_subcontractors}
                icon={Users}
                color="green"
                href="/dashboard/subcontractors"
              />
            )}
            {canAccessProfessionals() && (
              <StatCard
                title="Professionals"
                value={analytics.total_professionals || 0}
                change={analytics.new_professionals}
                icon={Building2}
                color="purple"
                href="/dashboard/professionals"
              />
            )}
            <StatCard
              title="Average Rating"
              value={analytics.average_rating ? parseFloat(analytics.average_rating.toFixed(1)) : 0}
              icon={TrendingUp}
              color="orange"
            />
            <StatCard
              title="Total Ratings"
              value={analytics.total_ratings || 0}
              icon={Users}
              color="red"
            />
          </>
        )}

        {userType === 'consultants' && (
          <>
            {canAccessAgencies() && (
              <StatCard
                title="Total Agencies"
                value={analytics.total_agencies || 0}
                change={analytics.new_agencies}
                icon={Building2}
                color="blue"
                href="/dashboard/agencies"
              />
            )}
            <StatCard
              title="News Articles"
              value={analytics.total_news || 0}
              change={analytics.new_news}
              icon={Newspaper}
              color="green"
              href="/dashboard/news"
            />
            <StatCard
              title="Average Rating"
              value={analytics.average_rating ? parseFloat(analytics.average_rating.toFixed(1)) : 0}
              icon={TrendingUp}
              color="orange"
            />
            <StatCard
              title="Total Ratings"
              value={analytics.total_ratings || 0}
              icon={Users}
              color="red"
            />
          </>
        )}

        {userType === 'subcontractors' && (
          <>
            <StatCard
              title="Total Projects"
              value={analytics.total_projects || 0}
              change={analytics.new_projects}
              icon={Briefcase}
              color="blue"
              href="/dashboard/othercontractors"
            />
            <StatCard
              title="Average Rating"
              value={analytics.average_rating ? parseFloat(analytics.average_rating.toFixed(1)) : 0}
              icon={TrendingUp}
              color="orange"
            />
            <StatCard
              title="Total Ratings"
              value={analytics.total_ratings || 0}
              icon={Users}
              color="red"
            />
          </>
        )}

        {userType === 'professionals' && (
          <>
            <StatCard
              title="Total Projects"
              value={analytics.total_projects || 0}
              change={analytics.new_projects}
              icon={Briefcase}
              color="blue"
              href="/dashboard/othercontractors"
            />
            <StatCard
              title="Average Rating"
              value={analytics.average_rating ? parseFloat(analytics.average_rating.toFixed(1)) : 0}
              icon={TrendingUp}
              color="orange"
            />
            <StatCard
              title="Total Ratings"
              value={analytics.total_ratings || 0}
              icon={Users}
              color="red"
            />
          </>
        )}
           </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {userType === 'admin' && (
              <>
                <Button asChild className="h-20 flex-col gap-2">
                  <Link href="/dashboard/materials">
                    <Package className="h-6 w-6" />
                    <span>Materials</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/dashboard/machineries">
                    <Wrench className="h-6 w-6" />
                    <span>Machineries</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/dashboard/ads">
                    <FileText className="h-6 w-6" />
                    <span>Ads</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/dashboard/news">
                    <Newspaper className="h-6 w-6" />
                    <span>News</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/dashboard/othercontractors">
                    <Briefcase className="h-6 w-6" />
                    <span>Contractors</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/dashboard/subcontractors">
                    <Users className="h-6 w-6" />
                    <span>Subcontractors</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/dashboard/professionals">
                    <Building2 className="h-6 w-6" />
                    <span>Professionals</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/dashboard/agencies">
                    <Building2 className="h-6 w-6" />
                    <span>Agencies</span>
                  </Link>
                </Button>
              </>
            )}

            {userType === 'suppliers' && (
              <>
                <Button asChild className="h-20 flex-col gap-2">
                  <Link href="/dashboard/materials">
                    <Package className="h-6 w-6" />
                    <span>Materials</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/dashboard/machineries">
                    <Wrench className="h-6 w-6" />
                    <span>Machineries</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/dashboard/profile">
                    <Users className="h-6 w-6" />
                    <span>Profile</span>
                  </Link>
                </Button>
              </>
            )}

            {userType === 'contractors' && (
              <>
                <Button asChild className="h-20 flex-col gap-2">
                  <Link href="/dashboard/othercontractors">
                    <Briefcase className="h-6 w-6" />
                    <span>Projects</span>
                  </Link>
                </Button>
                {canAccessSubcontractors() && (
                  <Button asChild variant="outline" className="h-20 flex-col gap-2">
                    <Link href="/dashboard/subcontractors">
                      <Users className="h-6 w-6" />
                      <span>Subcontractors</span>
                    </Link>
                  </Button>
                )}
                {canAccessProfessionals() && (
                  <Button asChild variant="outline" className="h-20 flex-col gap-2">
                    <Link href="/dashboard/professionals">
                      <Building2 className="h-6 w-6" />
                      <span>Professionals</span>
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/dashboard/profile">
                    <Users className="h-6 w-6" />
                    <span>Profile</span>
                  </Link>
                </Button>
              </>
            )}

            {userType === 'consultants' && (
              <>
                {canAccessAgencies() && (
                  <Button asChild className="h-20 flex-col gap-2">
                    <Link href="/dashboard/agencies">
                      <Building2 className="h-6 w-6" />
                      <span>Agencies</span>
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/dashboard/news">
                    <Newspaper className="h-6 w-6" />
                    <span>News</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/dashboard/profile">
                    <Users className="h-6 w-6" />
                    <span>Profile</span>
                  </Link>
                </Button>
              </>
            )}

            {userType === 'subcontractors' && (
              <>
                <Button asChild className="h-20 flex-col gap-2">
                  <Link href="/dashboard/othercontractors">
                    <Briefcase className="h-6 w-6" />
                    <span>Projects</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/dashboard/profile">
                    <Users className="h-6 w-6" />
                    <span>Profile</span>
                  </Link>
                </Button>
              </>
            )}

            {userType === 'professionals' && (
              <>
                <Button asChild className="h-20 flex-col gap-2">
                  <Link href="/dashboard/othercontractors">
                    <Briefcase className="h-6 w-6" />
                    <span>Projects</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/dashboard/profile">
                    <Users className="h-6 w-6" />
                    <span>Profile</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Breakdown for Admin */}
      {userType === 'admin' && analytics.user_breakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              User Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                      <div>
                    <p className="text-sm font-medium text-blue-600">Suppliers</p>
                    <p className="text-2xl font-bold text-blue-900">{analytics.user_breakdown.suppliers}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                        </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Contractors</p>
                    <p className="text-2xl font-bold text-green-900">{analytics.user_breakdown.contractors}</p>
                        </div>
                  <Briefcase className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Consultants</p>
                    <p className="text-2xl font-bold text-purple-900">{analytics.user_breakdown.consultants}</p>
                      </div>
                  <Building2 className="h-8 w-8 text-purple-600" />
                      </div>
                      </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Professionals</p>
                    <p className="text-2xl font-bold text-orange-900">{analytics.user_breakdown.professionals}</p>
                      </div>
                  <Users className="h-8 w-8 text-orange-600" />
                      </div>
                      </div>
          </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userType === 'admin' && analytics.recent_activity ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Recent Users
                </h4>
                <div className="space-y-3">
                  {analytics.recent_activity.recent_users.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.first_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">{user.user_type}</p>
                        </div>
            </div>
                      <span className="text-xs text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
      </div>
                  ))}
        </div>
      </div>

              {/* Recent Materials */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Recent Materials
                </h4>
                <div className="space-y-3">
                  {analytics.recent_activity.recent_materials.map((material, index) => (
                    <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{material.name}</p>
                          <p className="text-sm text-gray-500">Material</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(material.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Activity data will be available soon</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
  );
}
