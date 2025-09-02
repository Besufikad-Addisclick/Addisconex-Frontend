// components/layout/DashboardHeader.tsx
"use client";

import { useState, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, User, LogOut, ChevronDown, PlusCircle, Wrench, Building2, Building, Menu, Home, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { ProfileOutlined } from '@ant-design/icons';
import { cn } from '@/lib/utils';

const DashboardHeader = memo(() => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSubmenuOpen, setIsMobileSubmenuOpen] = useState(false);
  const { session, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  if (isLoading) {
    return (
      <div className="bg-gray-200 border-b border-gray-200 sticky top-0 z-50 h-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will be handled by ProtectedRoute
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('[navbar] Logout error:', error);
    }
  };

  const avatarInitial = session.user.email?.[0]?.toUpperCase() || 'U';

  // Navigation configuration based on user_type
  const navItems = [
    {
      label: 'Home',
      path: '/dashboard',
      icon: <Home className="h-4 w-4" />,
      allowedTypes: ['contractors', 'suppliers', 'subcontractors', 'consultants', 'admin','professionals','individuals','agencies'],
    },
    {
      label: 'Post',
      path: null,
      icon: <PlusCircle className="h-4 w-4" />,
      allowedTypes: [ 'suppliers', 'admin'],
      submenu: [
    {
      label: 'Material Prices',
      path: '/dashboard/material-prices',
      icon: <PlusCircle className="h-4 w-4" />,
    },
    {
      label: 'Machineries Prices',
      path: '/dashboard/machineries-prices',
      icon: <PlusCircle className="h-4 w-4" />,
        },
      ],
    },
    {
      label: 'Machineries',
      path: '/dashboard/machineries',
      icon: <Wrench className="h-4 w-4" />,
      allowedTypes: ['contractors', 'suppliers', 'subcontractors', 'consultants', 'admin','individuals'],
    },
    {
      label: 'Subcontractors',
      path: '/dashboard/subcontractors',
      icon: <Building2 className="h-4 w-4" />,
      allowedTypes: ['contractors', 'suppliers', 'subcontractors', 'consultants', 'admin','individuals','agencies'],
    },
    {
      label: 'Consultants',
      path: '/dashboard/consultants',
      icon: <Building className="h-4 w-4" />,
      allowedTypes: ['contractors', 'suppliers', 'subcontractors', 'consultants', 'admin','individuals'],
    },
    {
      label: 'Contractors',
      path: '/dashboard/othercontractors',
      icon: <Building className="h-4 w-4" />,
      allowedTypes: ['contractors', 'suppliers', 'subcontractors', 'consultants', 'admin','individuals','agencies'],
    },
    {
      label: 'Agencies',
      path: '/dashboard/agencies',
      icon: <Building className="h-4 w-4" />,
      allowedTypes: ['contractors', 'suppliers', 'subcontractors', 'consultants', 'admin','individuals'],
    },
    {
      label: 'Professionals',
      path: '/dashboard/professionals',
      icon: <Building className="h-4 w-4" />,
      allowedTypes: ['contractors', 'suppliers', 'subcontractors', 'consultants', 'admin','professionals','individuals'],
    },
  ];

  // Filter nav items based on user_type
  const allowedNavItems = navItems.filter(item => item.allowedTypes.includes(session.user.userType));

  return (
    <header className="bg-gray-200 border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="no-underline">
                    <div className="flex items-center transition-transform duration-300 hover:scale-105">
                      <Image
                        src="/logotransparent.png"
                        alt="AddisPrice"
                        width={70}
                        height={30}
                        className="filter brightness-100"
                        priority
                      />
                    </div>
                  </Link>
         

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 justify-center items-center space-x-2">
            {allowedNavItems.map(item => (
              <div key={item.path || item.label} className="relative group">
                {item.submenu ? (
                  // Submenu item
                  <Button
                    variant={pathname.startsWith('/dashboard/material-prices') || pathname.startsWith('/dashboard/machineries-prices') ? 'orange' : 'outline'}
                    className="flex items-center space-x-2 transition-all duration-300 hover:scale-105"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                  </Button>
                ) : (
                  // Regular navigation item
              <Button
                variant={pathname === item.path ? 'orange' : 'outline'}
                    className="flex items-center space-x-2 transition-all duration-300 hover:scale-105"
                    onClick={() => item.path && router.push(item.path)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
                )}
                
                {/* Submenu dropdown */}
                {item.submenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 min-w-[200px] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50"
                  >
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.path}
                        href={subitem.path}
                        className={cn(
                          "flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200",
                          pathname === subitem.path ? "bg-orange-50 text-orange-600" : ""
                        )}
                      >
                        {subitem.icon}
                        <span>{subitem.label}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </nav>

          {/* Medium Screen Navigation (Tablet) */}
          <nav className="hidden md:flex lg:hidden flex-1 justify-center items-center space-x-1">
            {allowedNavItems.slice(0, 4).map(item => (
              <div key={item.path || item.label} className="relative group">
                {item.submenu ? (
                  // Submenu item for medium screens
                  <Button
                    variant={pathname.startsWith('/dashboard/material-prices') || pathname.startsWith('/dashboard/machineries-prices') ? 'orange' : 'outline'}
                    size="sm"
                    className="flex items-center space-x-1 transition-all duration-300 hover:scale-105"
                  >
                    {item.icon}
                    <span className="text-xs">{item.label}</span>
                    <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
                  </Button>
                ) : (
                  // Regular navigation item for medium screens
                  <Button
                    variant={pathname === item.path ? 'orange' : 'outline'}
                    size="sm"
                    className="flex items-center space-x-1 transition-all duration-300 hover:scale-105"
                    onClick={() => item.path && router.push(item.path)}
                  >
                    {item.icon}
                    <span className="text-xs">{item.label}</span>
                  </Button>
                )}
                
                {/* Submenu dropdown for medium screens */}
                {item.submenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 min-w-[180px] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50"
                  >
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.path}
                        href={subitem.path}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200",
                          pathname === subitem.path ? "bg-orange-50 text-orange-600" : ""
                        )}
                      >
                        {subitem.icon}
                        <span>{subitem.label}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-xl rounded-xl max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">You have 3 new notifications</p>
                </div>
                
                {/* Sample Notifications */}
                <div className="p-2 space-y-2">
                  <DropdownMenuItem className="cursor-pointer p-3 hover:bg-orange-50 transition-colors duration-200 rounded-lg">
                    <div className="flex items-start space-x-3 w-full">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">New Material Price Update</p>
                        <p className="text-xs text-gray-500 mt-1">Cement prices have been updated for this week</p>
                        <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="cursor-pointer p-3 hover:bg-orange-50 transition-colors duration-200 rounded-lg">
                    <div className="flex items-start space-x-3 w-full">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">New Machinery Available</p>
                        <p className="text-xs text-gray-500 mt-1">Excavator rental is now available in your area</p>
                        <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="cursor-pointer p-3 hover:bg-orange-50 transition-colors duration-200 rounded-lg">
                    <div className="flex items-start space-x-3 w-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Profile Update Required</p>
                        <p className="text-xs text-gray-500 mt-1">Please update your contact information</p>
                        <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>
                
                <div className="p-3 border-t border-gray-100">
                  <Button variant="outline" className="w-full text-sm">
                    View All Notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={isMobileMenuOpen} onOpenChange={(open) => {
              setIsMobileMenuOpen(open);
              if (!open) {
                setIsMobileSubmenuOpen(false);
              }
            }}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open mobile menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-4">
                {/* Mobile Menu Header with Close Button */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <nav className="flex flex-col space-y-2">
                  {allowedNavItems.map(item => (
                    <div key={item.path || item.label}>
                      {item.submenu ? (
                        // Collapsible submenu item for mobile
                        <div className="space-y-2">
                          <button
                            onClick={() => setIsMobileSubmenuOpen(!isMobileSubmenuOpen)}
                            className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                          >
                            <div className="flex items-center space-x-2">
                              {item.icon}
                              <span className="font-medium text-gray-700">{item.label}</span>
                            </div>
                            <ChevronDown 
                              className={cn(
                                "h-4 w-4 text-gray-500 transition-transform duration-200",
                                isMobileSubmenuOpen ? "rotate-180" : ""
                              )} 
                            />
                          </button>
                          {isMobileSubmenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pl-6 space-y-1 overflow-hidden"
                            >
                              {item.submenu.map((subitem) => (
                                <Link
                                  key={subitem.path}
                                  href={subitem.path}
                                  className={cn(
                                    "flex items-center space-x-2 p-3 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-md transition-all duration-200",
                                    pathname === subitem.path ? "bg-orange-50 text-orange-600" : ""
                                  )}
                                  onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setIsMobileSubmenuOpen(false);
                                  }}
                                >
                                  {subitem.icon}
                                  <span>{subitem.label}</span>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        // Regular navigation item for mobile
                    <Button
                      variant={pathname === item.path ? 'default' : 'outline'}
                          className="justify-start w-full"
                      onClick={() => {
                        router.push(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Button
                    variant="outline"
                      className="justify-start w-full"
                    onClick={() => {
                      router.push('/dashboard/profile');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                  <Button
                    variant="outline"
                      className="justify-start w-full"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* User Actions (Desktop) */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-orange-50 rounded-full relative transition-all duration-200 group"
              aria-label="Notifications"
            >
                  <Bell className="h-5 w-5 text-gray-600 group-hover:text-orange-600 transition-colors duration-200" />
                  <motion.span 
                    className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-xl rounded-xl max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">You have 3 new notifications</p>
                </div>
                
                {/* Sample Notifications */}
                <div className="p-2 space-y-2">
                  <DropdownMenuItem className="cursor-pointer p-3 hover:bg-orange-50 transition-colors duration-200 rounded-lg">
                    <div className="flex items-start space-x-3 w-full">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">New Material Price Update</p>
                        <p className="text-xs text-gray-500 mt-1">Cement prices have been updated for this week</p>
                        <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="cursor-pointer p-3 hover:bg-orange-50 transition-colors duration-200 rounded-lg">
                    <div className="flex items-start space-x-3 w-full">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">New Machinery Available</p>
                        <p className="text-xs text-gray-500 mt-1">Excavator rental is now available in your area</p>
                        <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="cursor-pointer p-3 hover:bg-orange-50 transition-colors duration-200 rounded-lg">
                    <div className="flex items-start space-x-3 w-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Profile Update Required</p>
                        <p className="text-xs text-gray-500 mt-1">Please update your contact information</p>
                        <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>
                
                <div className="p-3 border-t border-gray-100">
                  <Button variant="outline" className="w-full text-sm">
                    View All Notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile dropdown */}
            <DropdownMenu onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="ghost" className="flex items-center space-x-2 p-2 h-auto hover:bg-orange-50 transition-all duration-200">
                    <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-orange-200 transition-all duration-200">
                      <AvatarFallback className="bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 font-semibold">
                        {avatarInitial}
                      </AvatarFallback>
                  </Avatar>
                  <motion.div
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="block"
                  >
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                  </motion.div>
                </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-xl rounded-xl">
                <DropdownMenuItem className="cursor-pointer p-3 hover:bg-orange-50 transition-colors duration-200">
                  <ProfileOutlined className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-gray-900 break-all" title={session.user.email}>{session.user.email}</span>
                    <span className="text-xs text-gray-500 capitalize">{session.user.userType?.replace('_', ' ')}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer p-3 hover:bg-orange-50 transition-colors duration-200"
                  onClick={() => router.push('/dashboard/profile')}
                >
                  <User className="h-4 w-4 mr-3 text-gray-500" />
                  Profile
                </DropdownMenuItem>
                {allowedNavItems
                  .filter(item => item.path && item.path !== '/dashboard' && !item.submenu) // Exclude Home, items with submenus, and items without paths
                  .map(item => (
                    <DropdownMenuItem
                      key={item.path}
                      className="cursor-pointer p-3 hover:bg-orange-50 transition-colors duration-200"
                      onClick={() => item.path && router.push(item.path)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer p-3 hover:bg-red-50 hover:text-red-600 transition-colors duration-200">
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;