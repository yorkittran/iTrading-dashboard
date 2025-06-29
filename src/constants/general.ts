/**
 * General Application Constants
 * Centralized constants for roles, statuses, types, etc.
 *
 * Usage Examples:
 *
 * 1. In filtering logic:
 *    const adminUsers = users.filter(u => u.role === USER_ROLES.ADMIN)
 *
 * 2. In Badge components:
 *    <Badge variant={USER_ROLES.SUPER_ADMIN} />
 *
 * 3. In conditionals:
 *    if (user.status === USER_STATUSES.ACTIVE) { ... }
 *
 * 4. In form options:
 *    const roleOptions = Object.values(USER_ROLES)
 */

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user'
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

// User Statuses
export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  INVITED: 'invited'
} as const

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES]

// Post Statuses
export const POST_STATUSES = {
  PUBLISHED: 'published',
  DRAFT: 'draft'
} as const

export type PostStatus = (typeof POST_STATUSES)[keyof typeof POST_STATUSES]

// Post Types
export const POST_TYPES = {
  NEWS: 'news',
  EVENT: 'event',
  TERMS_OF_USE: 'terms_of_use',
  PRIVACY_POLICY: 'privacy_policy'
} as const

export type PostType = (typeof POST_TYPES)[keyof typeof POST_TYPES]

// Product Types
export const PRODUCT_TYPES = {
  SUBSCRIPTION: 'subscription',
  ONE_TIME: 'one-time'
} as const

export type ProductType = (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES]

// Banner Statuses
export const BANNER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const

export type BannerStatus = (typeof BANNER_STATUSES)[keyof typeof BANNER_STATUSES]

// Combined for Badge component usage
export const ALL_BADGE_VARIANTS = {
  // User roles
  ...USER_ROLES,
  // User statuses
  ...USER_STATUSES,
  // Post statuses
  ...POST_STATUSES,
  // Post types
  ...POST_TYPES,
  // Product types
  ...PRODUCT_TYPES
} as const

export type BadgeVariant = (typeof ALL_BADGE_VARIANTS)[keyof typeof ALL_BADGE_VARIANTS]

// Labels mapping for display
export const LABELS = {
  // User Roles
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.USER]: 'User',

  // User Statuses
  [USER_STATUSES.ACTIVE]: 'Active',
  [USER_STATUSES.INACTIVE]: 'Inactive',
  [USER_STATUSES.SUSPENDED]: 'Suspended',
  [USER_STATUSES.INVITED]: 'Invited',

  // Post Statuses
  [POST_STATUSES.PUBLISHED]: 'Published',
  [POST_STATUSES.DRAFT]: 'Draft',

  // Post Types
  [POST_TYPES.NEWS]: 'News',
  [POST_TYPES.EVENT]: 'Event',
  [POST_TYPES.TERMS_OF_USE]: 'Terms of Use',
  [POST_TYPES.PRIVACY_POLICY]: 'Privacy Policy',

  // Product Types
  [PRODUCT_TYPES.SUBSCRIPTION]: 'Subscription',
  [PRODUCT_TYPES.ONE_TIME]: 'One-time'
} as const

// Color schemes for different variants with light and dark theme support
export const BADGE_STYLES = {
  // User Roles
  [USER_ROLES.SUPER_ADMIN]: {
    background: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-800 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-700/50'
  },
  [USER_ROLES.ADMIN]: {
    background: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-700/50'
  },
  [USER_ROLES.USER]: {
    background: 'bg-gray-100 dark:bg-gray-700/50',
    text: 'text-gray-800 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-600/50'
  },

  // User Statuses
  [USER_STATUSES.ACTIVE]: {
    background: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-200 dark:border-green-700/50'
  },
  [USER_STATUSES.INACTIVE]: {
    background: 'bg-gray-100 dark:bg-gray-700/50',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-600/50'
  },
  [USER_STATUSES.SUSPENDED]: {
    background: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-200 dark:border-red-700/50'
  },
  [USER_STATUSES.INVITED]: {
    background: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-700/50'
  },

  // Post Statuses
  [POST_STATUSES.PUBLISHED]: {
    background: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-200 dark:border-green-700/50'
  },
  [POST_STATUSES.DRAFT]: {
    background: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-700/50'
  },

  // Post Types
  [POST_TYPES.NEWS]: {
    background: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-700/50'
  },
  [POST_TYPES.EVENT]: {
    background: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-800 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-700/50'
  },
  [POST_TYPES.TERMS_OF_USE]: {
    background: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-200 dark:border-red-700/50'
  },
  [POST_TYPES.PRIVACY_POLICY]: {
    background: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-800 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-700/50'
  },

  // Product Types
  [PRODUCT_TYPES.SUBSCRIPTION]: {
    background: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-700/50'
  },
  [PRODUCT_TYPES.ONE_TIME]: {
    background: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-200 dark:border-green-700/50'
  }
} as const

// Helper functions
export const getLabel = (variant: BadgeVariant): string => {
  return LABELS[variant] || variant
}

export const getBadgeStyle = (variant: BadgeVariant) => {
  return BADGE_STYLES[variant] || BADGE_STYLES[USER_ROLES.USER]
}
