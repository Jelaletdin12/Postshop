"use client"

import type React from "react"
import Link from "next/link"
import { User, Truck, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart, useFavorites, useOrders } from "@/lib/hooks"
import { Skeleton } from "@/components/ui/skeleton"

interface ActionButtonsProps {
  isAuthenticated: boolean
  onAuthClick: () => void
  translations: {
    profile: string
    login: string
    orders: string
    favorites: string
    cart: string
  }
}

interface ActionButtonData {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
  badgeCount?: number
  isLoading?: boolean
}

export default function ActionButtons({ isAuthenticated, onAuthClick, translations: t }: ActionButtonsProps) {
  const { data: cartData, isLoading: cartLoading } = useCart()
  const { data: favoritesData, isLoading: favoritesLoading } = useFavorites()
  const { data: ordersData, isLoading: ordersLoading } = useOrders()

  const buttons: ActionButtonData[] = [
    {
      icon: <User className="h-5 w-5 text-gray-600" />,
      label: isAuthenticated ? t.profile : t.login,
      onClick: onAuthClick,
    },
    {
      icon: <Truck className="h-5 w-5 text-gray-600" />,
      label: t.orders,
      href: "/orders",
      badgeCount: ordersData?.length || 0,
      isLoading: ordersLoading,
    },
    {
      icon: <Heart className="h-5 w-5 text-gray-600" />,
      label: t.favorites,
      href: "/favorites",
      badgeCount: favoritesData?.length || 0,
      isLoading: favoritesLoading,
    },
    {
      icon: <ShoppingCart className="h-5 w-5 text-gray-600" />,
      label: t.cart,
      href: "/cart",
      badgeCount: cartData?.count || 0,
      isLoading: cartLoading,
    },
  ]

  return (
    <div className="hidden items-center gap-1 md:flex">
      {buttons.map((button, index) => (
        <ActionButton key={index} {...button} />
      ))}
    </div>
  )
}

function ActionButton({ icon, label, href, onClick, badgeCount, isLoading }: ActionButtonData) {
  const buttonContent = (
    <Button variant="ghost" size="sm" className="relative flex-col gap-0.5 h-auto px-2 py-2" onClick={onClick}>
      <div className="relative">
        {icon}
        {badgeCount !== undefined && (
          <Badge
            variant="destructive"
            className="absolute -right-2 -top-2 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
          >
            {isLoading ? <Skeleton className="h-3 w-3 rounded-full" /> : badgeCount}
          </Badge>
        )}
      </div>
      <span className="text-xs text-gray-700">{label}</span>
    </Button>
  )

  if (href) {
    return <Link href={href}>{buttonContent}</Link>
  }

  return buttonContent
}
