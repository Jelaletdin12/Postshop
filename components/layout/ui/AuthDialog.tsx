import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Logo from "@/public/logo.png";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  translations: {
    enterPhone: string;
    weWillSendCode: string;
    phone: string;
    code: string;
    send: string;
  };
}

export default function AuthDialog({
  isOpen,
  onClose,
  translations: t,
}: AuthDialogProps) {
  const [phone, setPhone] = useState("993");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    if (phone.length > 3) {
      setOtpSent(true);
    }
  };

  const handleLogin = () => {
    // Here you can add authentication logic
    resetDialog();
  };

  const resetDialog = () => {
    onClose();
    setOtpSent(false);
    setPhone("993");
    setOtp("");
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative h-8 w-[180px]">
              <Image src={Logo} alt="Logo" fill className="object-contain" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            {t.enterPhone}
          </DialogTitle>
          <p className="text-center text-sm text-gray-600">
            {t.weWillSendCode}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Input
            type="tel"
            placeholder={t.phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 rounded-xl"
            onKeyDown={(e) => handleKeyPress(e, handleSendOtp)}
            disabled={otpSent}
          />

          {otpSent && (
            <Input
              type="text"
              placeholder={t.code}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="h-12 rounded-xl"
              onKeyDown={(e) => handleKeyPress(e, handleLogin)}
              autoFocus
            />
          )}

          <Button
            onClick={otpSent ? handleLogin : handleSendOtp}
            className="w-full h-12 rounded-xl font-bold text-base"
            size="lg"
          >
            {t.send}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}