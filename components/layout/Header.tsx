// components/layout/Header.tsx
"use client";

import { useState, useEffect, memo, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X, LanguagesIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Header = memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsSubmenuOpen, setIsProductsSubmenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: "/auth/login",
      });
      // Force a hard refresh to ensure session is cleared
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("[navbar] Logout error:", error);
    }
  }, []);

  const productLinks = useMemo(() => [
    { name: "Concrete Work", href: "/products?category=concrete-work" },
    { name: "Finishing", href: "/products?category=finishing" },
    {
      name: "Excavation and Earth works",
      href: "/products?excavation-and-earth-works",
    },
    { name: "Electrical", href: "/products?category=electrical" },
    {
      name: "Carpentry and Joinery",
      href: "/products?category=carpentry-and-joinery",
    },
    {
      name: "Block Work/ Walling",
      href: "/products?category=block-work/-walling",
    },
    { name: "Glazing", href: "/products?category=glazing" },
    { name: "Masonry Work", href: "/products?category=masonry-work" },
    { name: "Metal Work", href: "/products?category=metal-work" },
    { name: "Painting", href: "/products?category=painting" },
    { name: "Sanitary", href: "/products?category=sanitary" },
    { name: "Bricks", href: "/products?category=bricks" },
    { name: "Tiles", href: "/products?category=tiles" },
    { name: "Glass", href: "/products?category=glass" },
    { name: "Aluminum", href: "/products?category=aluminum" },
    { name: "Gypsum", href: "/products?category=gypsum" },
    { name: "PVC", href: "/products?category=pvc" },
    { name: "Roofing", href: "/products?category=roofing" },
    { name: "Doors", href: "/products?category=doors" },
    { name: "Windows", href: "/products?category=windows" },
    { name: "Admixtures", href: "/products?category=admixtures" },
    { name: "Bitumen", href: "/products?category=bitumen" },
    { name: "Others", href: "/products?category=others" },
  ], []);

  const navLinks = useMemo(() => [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products", submenu: productLinks },
    { name: "Pricing", href: "/pricing" },
    { name: "News", href: "/blog" },
    { name: "What we serve", href: "/service" },
    { name: "Contact us", href: "/contact" },
  ], [productLinks]);

  return (
    <header
      className={cn(
        "fixed w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-gray-200 backdrop-blur-sm shadow-md py-2"
          : "bg-gray-200 py-4"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="no-underline">
            <div className="flex items-center transition-transform duration-300 hover:scale-105">
              <Image
                key="header-logo"
                src="/acx.png"
                alt="AddisConX"
                width={200}
                height={30}
                className="filter brightness-100"
                priority
              />
            </div>
          </Link>
          

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                <Link
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary py-2 inline-block",
                    pathname === link.href ? "text-primary" : "text-gray-800",
                    "relative"
                  )}
                >
                  <span className="flex items-center">
                    {link.name}
                    {link.submenu && <ChevronDown className="ml-1 h-4 w-4" />}
                  </span>
                  {pathname === link.href && (
                    <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-primary rounded transition-all duration-300"></span>
                  )}
                </Link>
                {link.submenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-1 min-w-[300px] sm:min-w-[400px] lg:min-w-[500px] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white rounded-lg shadow-lg py-4 px-2 border border-gray-100 z-50"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                      {link.submenu.map((sublink) => (
                        <Link
                          key={sublink.name}
                          href={sublink.href}
                          className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors rounded-md hover:shadow-sm"
                        >
                          {sublink.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:text-primary hover:bg-primary/10"
              aria-label="Search"
            >
              <Search size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:text-primary hover:bg-primary/10"
              aria-label="Language"
            >
              <LanguagesIcon size={20} />
            </Button>
            {status === "loading" ? (
              <Button variant="outline" disabled>
                Loading...
              </Button>
            ) : session ? (
              <>
                <Button variant="outline" className="text-sm" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="text-sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="orange" className="text-sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden">
            <Sheet
              open={isMobileMenuOpen}
              onOpenChange={(open) => {
                setIsMobileMenuOpen(open);
                if (!open) {
                  setIsProductsSubmenuOpen(false);
                }
              }}
            >
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700"
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] p-4 overflow-y-auto">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <div key={link.name}>
                      {link.submenu ? (
                        <div>
                          <button
                            onClick={() =>
                              setIsProductsSubmenuOpen(!isProductsSubmenuOpen)
                            }
                            className={cn(
                              "text-base font-medium py-2 block transition-colors hover:text-primary w-full text-left flex items-center justify-between",
                              pathname === link.href
                                ? "text-primary"
                                : "text-gray-800"
                            )}
                          >
                            {link.name}
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isProductsSubmenuOpen ? "rotate-180" : ""
                              )}
                            />
                          </button>
                          {isProductsSubmenuOpen && (
                            <div className="pl-4 mt-2 space-y-2 border-l-2 border-gray-200">
                              <div className="bg-gray-50 rounded-lg p-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                <div className="grid grid-cols-1 gap-1">
                                  {link.submenu.map((sublink) => (
                                    <Link
                                      key={sublink.name}
                                      href={sublink.href}
                                      className="block py-2 px-3 text-sm text-gray-600 hover:text-primary hover:bg-white transition-colors rounded-md"
                                      onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                      {sublink.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={link.href}
                          className={cn(
                            "text-base font-medium py-2 block transition-colors hover:text-primary",
                            pathname === link.href
                              ? "text-primary"
                              : "text-gray-800"
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.name}
                        </Link>
                      )}
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    {status === "loading" ? (
                      <Button variant="outline" disabled className="w-full">
                        Loading...
                      </Button>
                    ) : session ? (
                      <>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            router.push("/dashboard");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Dashboard
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          router.push("/auth/login");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";

export default Header;
