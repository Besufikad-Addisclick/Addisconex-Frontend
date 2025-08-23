"use client";

import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function DashboardSidebar({ isSidebarOpen, toggleSidebar }: DashboardSidebarProps) {
  const router = useRouter();
  const [activeMenuItem, setActiveMenuItem] = useState('/dashboard');

  const handleMenuItemClick = (path: string) => {
    setActiveMenuItem(path);
    router.push(path);
  };

  return (
    <>
      {/* Mobile sidebar toggle button (visible only on small screens) */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 right-4 z-30 lg:hidden bg-primary text-white p-3 rounded-full shadow-lg"
      >
        {isSidebarOpen ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 256 : 72,
          x: isSidebarOpen ? 0 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 left-0 h-screen bg-white shadow-lg z-20 lg:relative overflow-hidden"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.h1
                key="full-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl font-bold text-gray-800"
              >
                AddisPrice
              </motion.h1>
            ) : (
              <motion.div
                key="icon-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-primary rounded-md p-1"
              >
                <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center text-primary font-bold">
                  AC
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-100 hidden lg:block"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          <MenuItem 
            icon={<LayoutDashboard className="h-5 w-5 text-primary flex-shrink-0" />}
            text="Dashboard"
            path="/dashboard"
            isActive={activeMenuItem === '/dashboard'}
            isSidebarOpen={isSidebarOpen}
            onClick={() => handleMenuItemClick('/dashboard')}
            onHover={() => setActiveMenuItem('/dashboard')}
          />
          
          <MenuItem 
            icon={<Package className="h-5 w-5 text-primary flex-shrink-0" />}
            text="Materials"
            path="/materials"
            isActive={activeMenuItem === '/materials'}
            isSidebarOpen={isSidebarOpen}
            onClick={() => handleMenuItemClick('/materials')}
            onHover={() => setActiveMenuItem('/materials')}
          />
        </nav>
      </motion.aside>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black lg:hidden z-10"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  path: string;
  isActive: boolean;
  isSidebarOpen: boolean;
  onClick: () => void;
  onHover: () => void;
}

function MenuItem({ icon, text, path, isActive, isSidebarOpen, onClick, onHover }: MenuItemProps) {
  return (
    <motion.div
      whileHover={{ backgroundColor: '#f3f4f6' }}
      className={`flex items-center ${!isSidebarOpen ? 'justify-center' : ''} space-x-3 p-3 rounded-lg cursor-pointer relative ${
        isActive ? 'bg-gray-200' : ''
      }`}
      onClick={onClick}
      onHoverStart={onHover}
    >
      {icon}
      
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-700 font-medium whitespace-nowrap overflow-hidden"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
      
      {!isSidebarOpen && (
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 20 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap"
            >
              {text}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}