"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import Logo from "@/public/logo.png"
import { useLogin, useVerifyToken } from "@/lib/hooks/useAuth"

interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
  translations: {
    enterPhone: string
    weWillSendCode: string
    phone: string
    code: string
    send: string
    verify: string
    sending: string
    verifying: string
    invalidPhone: string
    invalidCode: string
    loginSuccess: string
    codeSent: string
  }
}

export default function AuthDialog({ isOpen, onClose, translations: t }: AuthDialogProps) {
  const [phone, setPhone] = useState("993")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [rawPhone, setRawPhone] = useState("")

  const { mutate: login, isPending: isLoginLoading } = useLogin()
  const { mutate: verifyToken, isPending: isVerifyLoading } = useVerifyToken()

  const resetDialog = () => {
    setOtpSent(false)
    setPhone("993")
    setOtp("")
    setRawPhone("")
    onClose()
  }

  const handleSendOtp = () => {
    const cleanPhone = phone.replace(/\D/g, "")
    
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith("993")) {
      toast.error(t.invalidPhone)
      return
    }

    const phoneNumber = cleanPhone.substring(3)
    setRawPhone(phoneNumber)

    login(
      { phone_number: phoneNumber },
      {
        onSuccess: () => {
          toast.success(t.codeSent)
          setOtpSent(true)
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Hata oluştu")
        },
      }
    )
  }

  const handleLogin = () => {
    if (otp.length < 4) {
      toast.error(t.invalidCode)
      return
    }

    verifyToken(
      {
        phone_number: rawPhone,
        code: otp,
      },
      {
        onSuccess: () => {
          toast.success(t.loginSuccess)
          resetDialog()
          window.location.reload()
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Kod yanlış")
        },
      }
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action()
    }
  }

  const formatPhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (!cleaned.startsWith("993")) {
      return "993"
    }
    return cleaned.substring(0, 11)
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative h-8 w-[180px]">
              <Image src={Logo} alt="Logo" fill className="object-contain" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">{t.enterPhone}</DialogTitle>
          <p className="text-center text-sm text-gray-600">{t.weWillSendCode}</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Input
              type="tel"
              placeholder={t.phone}
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              className="h-12 rounded-xl"
              onKeyDown={(e) => handleKeyPress(e, handleSendOtp)}
              disabled={otpSent || isLoginLoading}
              maxLength={11}
            />
            <p className="text-xs text-gray-500 mt-1">Format: 99365123456</p>
          </div>

          {otpSent && (
            <Input
              type="text"
              placeholder={t.code}
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
            className="w-full h-12 rounded-xl font-bold text-base"
            size="lg"
            disabled={isLoginLoading || isVerifyLoading}
          >
            {isLoginLoading
              ? t.sending
              : isVerifyLoading
                ? t.verifying
                : otpSent
                  ? t.verify
                  : t.send}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}