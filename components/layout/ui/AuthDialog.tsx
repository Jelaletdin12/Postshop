"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import Logo from "@/public/logo.webp";
import { useLogin, useVerifyToken } from "@/lib/hooks/useAuth";
import { useTranslations } from "next-intl";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [phone, setPhone] = useState("993");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [rawPhone, setRawPhone] = useState("");
  const t = useTranslations();

  const { mutate: login, isPending: isLoginLoading } = useLogin();
  const { mutate: verifyToken, isPending: isVerifyLoading } = useVerifyToken();

  const resetDialog = useCallback(() => {
    setOtpSent(false);
    setPhone("993");
    setOtp("");
    setRawPhone("");
    onClose();
  }, [onClose]);

  const handleSendOtp = useCallback(() => {
    const cleanPhone = phone.replace(/\D/g, "");
    
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith("993")) {
      toast.error(t("invalid_phone"));
      return;
    }

    const phoneNumber = cleanPhone.substring(3);
    setRawPhone(phoneNumber);

    login(
      { phone_number: phoneNumber },
      {
        onSuccess: () => {
          toast.success(t("code_sent"));
          setOtpSent(true);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || t("error_occurred"));
        },
      }
    );
  }, [phone, login, t]);

  const handleLogin = useCallback(() => {
    if (otp.length < 4) {
      toast.error(t("invalid_code"));
      return;
    }

    verifyToken(
      {
        phone_number: rawPhone,
        code: otp,
      },
      {
        onSuccess: () => {
          toast.success(t("login_success"));
          resetDialog();
          window.location.reload();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || t("wrong_code"));
        },
      }
    );
  }, [otp, rawPhone, verifyToken, resetDialog, t]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  }, []);

  const formatPhoneInput = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned.startsWith("993")) {
      return "993";
    }
    return cleaned.substring(0, 11);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={resetDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative h-8 w-[180px]">
              <Image src={Logo} alt="Logo" fill className="object-contain" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">{t("common.enterPhone")}</DialogTitle>
          <p className="text-center text-sm text-gray-600">{t("common.weWillSendCode")}</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Input
              type="tel"
              placeholder={t("common.phone")}
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              className="h-12 rounded-xl"
              onKeyDown={(e) => handleKeyPress(e, handleSendOtp)}
              disabled={otpSent || isLoginLoading}
              maxLength={11}
            />
            <p className="text-xs text-gray-500 mt-1">{t("phone_format")}</p>
          </div>

          {otpSent && (
            <Input
              type="text"
              placeholder={t("common.code")}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").substring(0, 6))}
              className="h-12 rounded-xl"
              onKeyDown={(e) => handleKeyPress(e, handleLogin)}
              disabled={isVerifyLoading}
              autoFocus
              maxLength={6}
            />
          )}

          <Button
            onClick={otpSent ? handleLogin : handleSendOtp}
            className="w-full cursor-pointer h-12 rounded-xl font-bold text-base bg-[#005bff] hover:bg-[#0041c4]"
            size="lg"
            disabled={isLoginLoading || isVerifyLoading}
          >
            {isLoginLoading
              ? t("sending")
              : isVerifyLoading
                ? t("verifying")
                : otpSent
                  ? t("verify")
                  : t("common.send")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}