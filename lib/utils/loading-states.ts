/**
 * Loading state utilities for better UX
 */

export const loadingMessages = {
  fetching: "Loading...",
  submitting: "Processing...",
  deleting: "Deleting...",
  updating: "Updating...",
  saving: "Saving...",
  cart: "Adding to cart...",
  checkout: "Processing order...",
} as const

export const skeletonCounts = {
  products: 10,
  categories: 6,
  cartItems: 3,
  orders: 6,
  reviews: 4,
} as const
