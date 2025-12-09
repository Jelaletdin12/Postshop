"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useSearchProducts } from "@/features/search/hooks/useSearch";
import Image from "next/image";
import { SearchIcon } from "@/components/icons";

interface SearchBarProps {
  isMobile: boolean;
  searchPlaceholder: string;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  locale?: string;
}

export default function SearchBar({
  isMobile,
  searchPlaceholder,
  isOpen,
  onClose,
  className = "",
  locale = "ru",
}: SearchBarProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useSearchProducts({ q: debouncedSearch });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    if (debouncedSearch && data?.data && data.data.length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [debouncedSearch, data]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleProductClick = (productId: number) => {
    router.push(`/${locale}/product/${productId}`);
    setSearchValue("");
    setShowResults(false);
    if (onClose) onClose();
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setShowResults(false);
  };

  const SearchResults = () => {
    if (!showResults || !data?.data) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-lg max-h-[400px] overflow-y-auto z-50">
        {data.data.map((product) => (
          <button
            key={product.id}
            onClick={() => handleProductClick(product.id)}
            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
          >
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-sm line-clamp-2">{product.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {product.price_amount} TMT
              </p>
              <p className="text-xs text-gray-500">{product.brand.name}</p>
            </div>
          </button>
        ))}
      </div>
    );
  };

  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="top-4 translate-y-0">
          <DialogHeader>
            <DialogTitle>{searchPlaceholder}</DialogTitle>
          </DialogHeader>
          <div className="relative" ref={searchRef}>
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-10 rounded-xl focus:border-[#005bff] focus-visible:border-[#005bff] focus-visible:ring-0 active:border-[#005bff]"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
            <SearchResults />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className={`bg-[#005bff] rounded-xl flex items-center relative ${className}`} ref={searchRef}>
      <div className="w-full relative">
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="border-[#005bff] w-full rounded-xl border-2 focus-visible:ring-0 bg-white px-2"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>
      <Button
        size="icon"
        className="h-auto hover:bg-[#005bff] cursor-pointer bg-transparent flex items-center mr-1.5 text-white"
      >
        <SearchIcon />
      </Button>
      <SearchResults />
    </div>
  );
}