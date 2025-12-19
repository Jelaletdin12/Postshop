import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StockLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  availableStock: number;
  t: (key: string, params?: any) => string;
}

export function StockLimitModal({
  open,
  onOpenChange,
  productName,
  availableStock,
  t,
}: StockLimitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-orange-100 p-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {t("stock_limit_title")}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {t("stock_limit_message", {
              product: productName,
              stock: availableStock,
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full rounded-lg cursor-pointer"
          >
            {t("understood")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}