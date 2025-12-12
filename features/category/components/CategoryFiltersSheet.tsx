import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryFiltersSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filterLabel: string;
  closeLabel: string;
  children: React.ReactNode;
}

export default function CategoryFiltersSheet({
  isOpen,
  onOpenChange,
  filterLabel,
  closeLabel,
  children,
}: CategoryFiltersSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          className="sm:hidden fixed bottom-20 right-4 rounded-xl font-bold gap-2 z-10 shadow-lg"
          size="lg"
        >
          {filterLabel}
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[290px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>{filterLabel}</SheetTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 rounded-md ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{closeLabel}</span>
          </button>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] p-4">
          {children}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}