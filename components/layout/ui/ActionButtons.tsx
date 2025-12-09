"use client";

import { useMemo } from "react";
import type React from "react";
import Link from "next/link";
import { User, Truck, Heart, Store, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart, useFavorites, useOrders } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useLogout } from "@/lib/hooks/useAuth";
import {
  CartIcon,
  FavoriteIcon,
  OrderIcon,
  ProfileIcon,
} from "@/components/icons";

interface ActionButtonsProps {
  isAuthenticated: boolean;
  onAuthClick: () => void;
  isLoading?: boolean;
  locale?: string;
}

interface ActionButtonData {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  badgeCount?: number;
  isLoading?: boolean;
}

export default function ActionButtons({
  isAuthenticated,
  onAuthClick,
  isLoading: authLoading,
  locale = "ru",
}: ActionButtonsProps) {
  const t = useTranslations();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const { data: cartData, isLoading: cartLoading } = useCart();
  const { data: favoritesData, isLoading: favoritesLoading } = useFavorites();
  const { data: ordersData, isLoading: ordersLoading } = useOrders();

  // Calculate cart count from cart items array
  const cartCount = useMemo(() => {
    if (!cartData?.data) return 0;
    return cartData.data.length;
  }, [cartData]);

  // Calculate favorites count
  const favoritesCount = useMemo(() => {
    if (!favoritesData) return 0;
    return Array.isArray(favoritesData) ? favoritesData.length : 0;
  }, [favoritesData]);

  // Calculate orders count
  const ordersCount = useMemo(() => {
    if (!ordersData) return 0;
    return Array.isArray(ordersData) ? ordersData.length : 0;
  }, [ordersData]);

  const handleLogout = () => {
    logout();
  };

  const buttons: ActionButtonData[] = useMemo(
    () => [
      {
        icon: <Store />,
        label: t("common.openStore"),
        href: "/openStore",
      },
      {
        icon: <OrderIcon />,
        label: t("common.orders"),
        href: "/orders",
        badgeCount: ordersCount,
        isLoading: ordersLoading,
      },
      {
        icon: <FavoriteIcon />,
        label: t("common.favorites"),
        href: "/favorites",
        badgeCount: favoritesCount,
        isLoading: favoritesLoading,
      },
      {
        icon: <CartIcon />,
        label: t("common.cart"),
        href: "/cart",
        badgeCount: cartCount,
        isLoading: cartLoading,
      }
      
    ],
    [
      ordersCount,
      ordersLoading,
      favoritesCount,
      favoritesLoading,
      cartCount,
      cartLoading,
      t,
    ]
  );

  return (
    <div className="hidden items-center gap-1 md:flex">
      {/* Profile/Login Button with Dropdown */}
      {authLoading ? (
        <div className="h-10 w-24 animate-pulse bg-gray-200 rounded" />
      ) : isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex-col gap-0.5 h-auto px-2 py-2"
            >
              <ProfileIcon />
              <span className="text-xs text-gray-700">{t("profile")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => (window.location.href = `/${locale}/me`)}
            >
              <User className="mr-2 h-4 w-4" />
              {t("profile")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? t("logging_out") : t("common.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="flex-col gap-0.5 h-auto px-2 py-2"
          onClick={onAuthClick}
        >
          <ProfileIcon />
          <span className="text-xs text-gray-700">{t("common.login")}</span>
        </Button>
      )}

      {/* Other Action Buttons */}
      {buttons.map((button, index) => (
        <ActionButton key={index} {...button} />
      ))}
    </div>
  );
}

function ActionButton({
  icon,
  label,
  href,
  onClick,
  badgeCount,
  isLoading,
}: ActionButtonData) {
  const buttonContent = (
    <Button
      variant="ghost"
      size="sm"
      className="relative flex-col gap-0.5 h-auto px-2 py-2"
      onClick={onClick}
    >
      <div className="relative">
        {icon}
        {badgeCount !== undefined && badgeCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-2 -top-2 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
          >
            {isLoading ? (
              <Skeleton className="h-3 w-3 rounded-full" />
            ) : (
              badgeCount
            )}
          </Badge>
        )}
      </div>
      <span className="text-xs text-gray-700">{label}</span>
    </Button>
  );

  if (href) {
    return <Link href={href}>{buttonContent}</Link>;
  }

  return buttonContent;
}
