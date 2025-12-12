"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Heart, Truck, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCategories, useCart, useFavorites, useOrders } from "@/lib/hooks";
import { useRouter } from "next/navigation";
interface MobileBottomNavProps {
  locale?: string;
  isAuthenticated?: boolean;
  translations?: {
    catalog: string;
    favorites: string;
    orders: string;
    cart: string;
    login: string;
    profile: string;
  };
  onLoginClick?: () => void;
  onProfileClick?: () => void;
}

export default function MobileBottomNav({
  locale = "ru",
  isAuthenticated = false,
  translations,
  onLoginClick,
  onProfileClick, // EKLENEN
}: MobileBottomNavProps) {
  const [isClient, setIsClient] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const { data: categories = [] } = useCategories();
  const { data: cartData } = useCart();
  const { data: favoritesData } = useFavorites();
  const { data: ordersData } = useOrders();
  const router = useRouter();
  const t = translations || {
    catalog: "Каталог",
    favorites: "Избранное",
    orders: "Заказы",
    cart: "Корзина",
    login: "Войти",
    profile: "Профиль",
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      if (onProfileClick) {
        onProfileClick();
      } else {
        router.push(`/${locale}/me`);
        console.log("hello");
      }
    } else if (onLoginClick) {
      onLoginClick();
    }
  };

  if (!isClient) return null;

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Catalog Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex-col gap-0.5 h-auto px-2 py-2"
            onClick={() => setIsCategoryOpen(true)}
          >
            <Menu className="h-5 w-5 text-gray-600" />
            <span className="text-xs text-gray-700">{t.catalog}</span>
          </Button>

          {/* Favorites Button */}
          <Link href="/favorites">
            <Button
              variant="ghost"
              size="sm"
              className="relative flex-col gap-0.5 h-auto px-2 py-2"
            >
              <div className="relative">
                <Heart className="h-5 w-5 text-gray-600" />
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                >
                  {favoritesData?.length || 0}
                </Badge>
              </div>
              <span className="text-xs text-gray-700">{t.favorites}</span>
            </Button>
          </Link>

          {/* Orders Button */}
          <Link href="/orders">
            <Button
              variant="ghost"
              size="sm"
              className="relative flex-col gap-0.5 h-auto px-2 py-2"
            >
              <div className="relative">
                <Truck className="h-5 w-5 text-gray-600" />
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                >
                  {ordersData?.length || 0}
                </Badge>
              </div>
              <span className="text-xs text-gray-700">{t.orders}</span>
            </Button>
          </Link>

          {/* Cart Button */}
          <Link href="/cart">
            <Button
              variant="ghost"
              size="sm"
              className="relative flex-col gap-0.5 h-auto px-2 py-2"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                >
                  {cartData?.data?.length || 0}
                </Badge>
              </div>
              <span className="text-xs text-gray-700">{t.cart}</span>
            </Button>
          </Link>

          {isAuthenticated ? (
            <Link href={`/${locale}/me`}>
              <Button
                variant="ghost"
                size="sm"
                className="flex-col gap-0.5 h-auto px-2 py-2"
              >
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-xs text-gray-700">{t.profile}</span>
              </Button>
            </Link>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="flex-col gap-0.5 h-auto px-2 py-2"
              onClick={onLoginClick}
            >
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-xs text-gray-700">{t.login}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Sheet/Drawer */}
      <Sheet open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
        <SheetContent side="left" className="w-[300px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>{t.catalog}</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4">
              {categories.map((category) => (
                <div key={category.id} className="mb-4">
                  <Link
                    href={`/category/${category.slug}?category_id=${category.id}`}
                    onClick={() => setIsCategoryOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                  >
                    <span>{category.name}</span>
                  </Link>

                  {/* Subcategories */}
                  {category.children && category.children.length > 0 && (
                    <div className="ml-8 mt-2 space-y-1">
                      {category.children.map((child: any) => (
                        <Link
                          key={child.id}
                          href={`/category/${child.slug}?category_id=${child.id}`}
                          onClick={() => setIsCategoryOpen(false)}
                          className="block px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
