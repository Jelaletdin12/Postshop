"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Logo from "@/public/logo.webp";
import { useLogin, useVerifyToken } from "@/lib/hooks/useAuth";
import { useTranslations } from "next-intl";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [phone, setPhone] = useState("+993 ");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const t = useTranslations();

  const { mutate: login, isPending: isLoginLoading } = useLogin();
  const { mutate: verifyToken, isPending: isVerifyLoading } = useVerifyToken();

  const resetDialog = useCallback(() => {
    setOtpSent(false);
    setPhone("+993 ");
    setOtp("");
    onClose();
  }, [onClose]);

  const formatPhoneForBackend = (phoneNumber: string): string => {
    return phoneNumber.replace(/^\+993\s*/, "").replace(/\s+/g, "");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const prefix = "+993 ";

    if (input.length < prefix.length) {
      setPhone(prefix);
      return;
    }

    const digitsOnly = input.substring(prefix.length).replace(/\D/g, "");

    const limitedDigits = digitsOnly.substring(0, 8);

    let formattedPhone = prefix;
    if (limitedDigits.length > 0) {
      formattedPhone += limitedDigits.substring(0, 2);

      if (limitedDigits.length > 2) {
        formattedPhone += " " + limitedDigits.substring(2);
      }
    }

    setPhone(formattedPhone);
  };

  const isPhoneValid = (): boolean => {
    const phoneDigits = formatPhoneForBackend(phone);
    return phoneDigits.length === 8;
  };

  const handleSendOtp = useCallback(() => {
    if (!isPhoneValid()) {
      toast.error(t("invalid_phone"));
      return;
    }

    const phoneNumber = formatPhoneForBackend(phone);

    login(
      { phone_number: parseInt(phoneNumber, 10) },
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

    const phoneNumber = formatPhoneForBackend(phone);

    verifyToken(
      {
        phone_number: parseInt(phoneNumber, 10),
        code: parseInt(otp, 10),
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
  }, [otp, phone, verifyToken, resetDialog, t]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent, action: () => void) => {
      if (e.key === "Enter") {
        action();
      }
    },
    []
  );

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
            {t("common.enterPhone")}
          </DialogTitle>
          <p className="text-center text-sm text-gray-600">
            {t("common.weWillSendCode")}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Input
              type="tel"
              placeholder="+993 61 097651"
              value={phone}
              onChange={handlePhoneChange}
              className="h-12 rounded-xl"
              onKeyDown={(e) => handleKeyPress(e, handleSendOtp)}
              disabled={otpSent || isLoginLoading}
            />
            <p className="text-xs text-gray-500 mt-1">{t("phone_format")}</p>
          </div>

          {otpSent && (
            <Input
              type="text"
              placeholder={t("common.code")}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").substring(0, 6))
              }
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
            disabled={
              isLoginLoading || isVerifyLoading || (!otpSent && !isPhoneValid())
            }
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
