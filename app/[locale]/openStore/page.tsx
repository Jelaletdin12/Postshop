"use client";

import type React from "react";
import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOpenStore } from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";

interface OpenStorePageProps {
  locale?: string;
  translations?: {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    uploadPatent: string;
    submit: string;
    selectedFile: string;
    firstNameRequired: string;
    lastNameRequired: string;
    emailInvalid: string;
    phoneInvalid: string;
    fileRequired: string;
    fileSizeError: string;
    fileTypeError: string;
  };
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  file: File | null;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  file?: string;
}

export default function OpenStorePage({
  locale = "ru",
  translations,
}: OpenStorePageProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+993",
    file: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [fileName, setFileName] = useState("");

  const { mutate: submitOpenStore, isPending: loading } = useOpenStore();
  const { toast } = useToast();

  const t = translations || {
    title: "Форма подачи заявления на открытие магазина",
    firstName: "Имя",
    lastName: "Фамилия",
    email: "Email",
    phone: "Телефон",
    uploadPatent: "Загрузите патент на розничную торговлю (PDF, JPG)",
    submit: "Отправить",
    selectedFile: "Выбранный файл",
    firstNameRequired: "Имя обязательно",
    lastNameRequired: "Фамилия обязательна",
    emailInvalid: "Некорректный email",
    phoneInvalid: "Некорректный номер телефона",
    fileRequired: "Патент обязателен",
    fileSizeError: "Файл слишком большой (макс. 25MB)",
    fileTypeError: "Только PDF и JPG документы",
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t.firstNameRequired;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t.lastNameRequired;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }

    const phoneRegex = /^\+?[0-9]{6,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = t.phoneInvalid;
    }

    if (!formData.file) {
      newErrors.file = t.fileRequired;
    } else {
      const allowedTypes = ["image/jpeg", "image/jpg", "application/pdf"];
      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file = t.fileTypeError;
      }
      if (formData.file.size > 25 * 1024 * 1024) {
        newErrors.file = t.fileSizeError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      setFileName(file.name);
      if (errors.file) {
        setErrors((prev) => ({ ...prev, file: undefined }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (formData.file) {
      submitOpenStore(
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          patentFile: formData.file,
        },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Your store request has been submitted successfully",
            });
            setFormData({
              firstName: "",
              lastName: "",
              email: "",
              phone: "+993",
              file: null,
            });
            setFileName("");
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: error?.message || "Failed to submit store request",
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  return (
    <div className=" bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t.title}</CardTitle>
          <CardDescription className="text-center">
            Заполните форму для подачи заявления
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">{t.firstName}</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">{t.lastName}</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+99361111111"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">{t.uploadPatent}</Label>
              <div className="flex flex-col gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => document.getElementById("file")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t.uploadPatent}
                </Button>
                {fileName && (
                  <p className="text-sm text-gray-600">
                    {t.selectedFile}: {fileName}
                  </p>
                )}
                {errors.file && (
                  <p className="text-sm text-red-500">{errors.file}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full cursor-pointer bg-[#005bff] hover:bg-[#0041c4]"
              disabled={loading}
            >
              {loading ? "Загрузка..." : t.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
