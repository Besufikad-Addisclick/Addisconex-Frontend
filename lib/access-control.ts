// lib/access-control.ts

export interface UserAccess {
  userType: string;
  currentPackageName?: string;
}

export interface PageAccess {
  path: string;
  allowedUserTypes: string[];
  requiredPackage?: string;
  allowedPackages?: string[];
}

// Define page access rules
export const PAGE_ACCESS_RULES: PageAccess[] = [
  // Admin can access all pages
  {
    path: '/dashboard',
    allowedUserTypes: ['admin', 'suppliers', 'contractors', 'consultants', 'subcontractors', 'professionals', 'individuals', 'agencies'],
  },
  {
    path: '/dashboard/materials',
    allowedUserTypes: ['admin', 'contractors', 'consultants', 'subcontractors', 'individuals'],
    allowedPackages: ['Essential', 'Pro', 'Premium', 'Consultant - Essential', 'Consultant - Pro', 'PRO'], // Contractors, consultants, and subcontractors need packages for materials
  },
  {
    path: '/dashboard/machineries',
    allowedUserTypes: ['admin', 'contractors', 'consultants', 'subcontractors', 'individuals', 'investors'],
    allowedPackages: ['Premium', 'Consultant - Pro', 'PRO'], // Premium contractors, Pro consultants, and Pro investors can access machinery
  },
  {
    path: '/dashboard/subcontractors',
    allowedUserTypes: ['admin', 'contractors', 'suppliers', 'subcontractors', 'consultants', 'individuals', 'agencies', 'investors'],
    allowedPackages: ['Material Supplier - Pro', 'Machinery Supplier - Pro', 'Pro', 'Premium', 'PRO'], // Pro packages + contractor Pro/Premium + subcontractor PRO + investor PRO
  },
  {
    path: '/dashboard/consultants',
    allowedUserTypes: ['admin', 'contractors', 'suppliers', 'subcontractors', 'consultants', 'individuals', 'investors'],
    allowedPackages: ['Premium', 'Consultant - Pro', 'PRO'], // Premium contractors, Pro consultants, and Pro investors can access consultants
  },
  {
    path: '/dashboard/othercontractors',
    allowedUserTypes: ['admin', 'contractors', 'suppliers', 'subcontractors', 'consultants', 'individuals', 'agencies', 'investors'],
    allowedPackages: ['Material Supplier - Pro', 'Machinery Supplier - Pro', 'Pro', 'Premium', 'Consultant - Pro', 'PRO'], // Pro packages + contractor Pro/Premium + consultant Pro + subcontractor PRO + investor PRO
  },
  {
    path: '/dashboard/agencies',
    allowedUserTypes: ['admin', 'contractors', 'suppliers', 'subcontractors', 'consultants', 'individuals', 'investors'],
    allowedPackages: ['Material Supplier - Pro', 'Machinery Supplier - Pro', 'Agency - Pro', 'Premium', 'Consultant - Pro', 'PRO'], // Pro packages + contractor Premium + consultant Pro + investor PRO
  },
  {
    path: '/dashboard/professionals',
    allowedUserTypes: ['admin', 'contractors', 'subcontractors', 'consultants', 'professionals', 'individuals', 'investors'],
    allowedPackages: ['Pro', 'Premium', 'Machinery Supplier - Pro', 'Consultant - Pro', 'PRO'], // Exclude Essential package for contractors, include PRO for investors
  },
  {
    path: '/dashboard/profile',
    allowedUserTypes: ['admin', 'suppliers', 'contractors', 'consultants', 'subcontractors', 'professionals', 'individuals', 'agencies', 'investors'],
  },
  
  // Detail pages - same access as their main pages
  {
    path: '/dashboard/materials/[id]',
    allowedUserTypes: ['admin', 'contractors', 'consultants', 'subcontractors', 'individuals'],
    allowedPackages: ['Essential', 'Pro', 'Premium', 'Consultant - Essential', 'Consultant - Pro', 'PRO'], // Contractors, consultants, and subcontractors need packages for materials
  },
  {
    path: '/dashboard/subcontractors/[id]',
    allowedUserTypes: ['admin', 'contractors', 'suppliers', 'subcontractors', 'consultants', 'individuals', 'agencies', 'investors'],
    allowedPackages: ['Material Supplier - Pro', 'Machinery Supplier - Pro', 'Pro', 'Premium', 'PRO'], // Pro packages + contractor Pro/Premium + subcontractor PRO + investor PRO
  },
  {
    path: '/dashboard/consultants/[id]',
    allowedUserTypes: ['admin', 'contractors', 'suppliers', 'subcontractors', 'consultants', 'individuals', 'investors'],
    allowedPackages: ['Premium', 'Consultant - Pro', 'PRO'], // Premium contractors, Pro consultants, and Pro investors can access consultants
  },
  {
    path: '/dashboard/othercontractors/[id]',
    allowedUserTypes: ['admin', 'contractors', 'suppliers', 'subcontractors', 'consultants', 'individuals', 'agencies', 'investors'],
    allowedPackages: ['Material Supplier - Pro', 'Machinery Supplier - Pro', 'Pro', 'Premium', 'Consultant - Pro', 'PRO'], // Pro packages + contractor Pro/Premium + consultant Pro + subcontractor PRO + investor PRO
  },
  {
    path: '/dashboard/agencies/[id]',
    allowedUserTypes: ['admin', 'contractors', 'suppliers', 'subcontractors', 'consultants', 'individuals', 'investors'],
    allowedPackages: ['Material Supplier - Pro', 'Machinery Supplier - Pro', 'Agency - Pro', 'Premium', 'Consultant - Pro', 'PRO'], // Pro packages + contractor Premium + consultant Pro + investor PRO
  },
  {
    path: '/dashboard/professionals/[id]',
    allowedUserTypes: ['admin', 'contractors', 'subcontractors', 'consultants', 'professionals', 'individuals', 'investors'],
    allowedPackages: ['Pro', 'Premium', 'Machinery Supplier - Pro', 'Consultant - Pro', 'PRO'], // Exclude Essential package for contractors, include PRO for investors
  },
  {
    path: '/dashboard/suppliers/[id]',
    allowedUserTypes: ['admin', 'suppliers', 'contractors', 'consultants', 'subcontractors', 'individuals'],
  },
  {
    path: '/dashboard/constructionWorkers/[id]',
    allowedUserTypes: ['admin', 'contractors', 'suppliers', 'subcontractors', 'consultants', 'individuals'],
  },
  
  // Package-specific access rules
  {
    path: '/dashboard/material-prices',
    allowedUserTypes: ['admin', 'suppliers'],
    allowedPackages: ['Material Supplier - Essential', 'Material Supplier - Pro'],
  },
  {
    path: '/dashboard/machineries-prices',
    allowedUserTypes: ['admin', 'suppliers'],
    allowedPackages: ['Machinery Supplier - Essential', 'Machinery Supplier - Pro'],
  },
];

/**
 * Check if a user has access to a specific page
 */
export function hasPageAccess(user: UserAccess, path: string): boolean {
  // Admin can access all pages
  if (user.userType === 'admin') {
    return true;
  }

  // Find the access rule for the path
  const rule = PAGE_ACCESS_RULES.find(rule => rule.path === path);
  
  if (!rule) {
    // If no specific rule exists, deny access
    return false;
  }

  // Check if user type is allowed
  if (!rule.allowedUserTypes.includes(user.userType)) {
    return false;
  }

  // Check package requirements if specified
  if (rule.allowedPackages) {
    // If user has no package but page requires one, deny access
    if (!user.currentPackageName) {
      return false;
    }
    // Check if user's package is in the allowed packages
    return rule.allowedPackages.includes(user.currentPackageName);
  }

  // If no package requirements, allow access
  return true;
}

/**
 * Get all accessible pages for a user
 */
export function getAccessiblePages(user: UserAccess): string[] {
  return PAGE_ACCESS_RULES
    .filter(rule => hasPageAccess(user, rule.path))
    .map(rule => rule.path);
}

/**
 * Check if user can access a specific feature based on package
 */
export function hasFeatureAccess(user: UserAccess, feature: string): boolean {
  if (user.userType === 'admin') {
    return true;
  }

  switch (feature) {
    case 'material-prices':
      return user.userType === 'suppliers' && 
             !!user.currentPackageName && 
             ['Material Supplier - Essential', 'Material Supplier - Pro'].includes(user.currentPackageName);
    
    case 'machinery-prices':
      return user.userType === 'suppliers' && 
             !!user.currentPackageName && 
             ['Machinery Supplier - Essential', 'Machinery Supplier - Pro'].includes(user.currentPackageName);
    
    default:
      return false;
  }
}
