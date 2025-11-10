import React, { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SearchBarProps {
  isMobile: boolean;
  searchPlaceholder: string;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function SearchBar({
  isMobile,
  searchPlaceholder,
  isOpen,
  onClose,
  className = "",
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value: string) => {
    setSearchValue(value);
    // Here you can add search logic or API call
  };

  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="top-4 translate-y-0">
          <DialogHeader>
            <DialogTitle>{searchPlaceholder}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-10 rounded-xl focus:border-[#005bff] focus-visible:border-[#005bff] focus-visible:ring-0 active:border-[#005bff]"
              autoFocus
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className={`bg-[#005bff] rounded-xl ${className}`}>
      <div className="w-full">
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="border-[#005bff] w-full rounded-xl border-2 focus-visible:ring-0 bg-white px-2"
        />
      </div>
      <Button
        size="icon"
        className="h-auto hover:bg-[#005bff] cursor-pointer bg-transparent flex items-center mr-1.5 text-white"
      >
        <Search className="h-5 w-5" />
      </Button>
    </div>
  );
}