"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/lib/hooks";
import { clearAuthToken } from "@/lib/api";

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export default function ClientProfilePage(props: ProfilePageProps) {
  const { data: user, isLoading, error } = useUserProfile();

  const translations = {
    profile: "Профиль",
    personalInfo: "Личная информация",
    profileDescription: "Ваши данные профиля",
    firstName: "Имя",
    lastName: "Фамилия",
    phone: "Номер телефона",
    address: "Адрес",
    logout: "Выйти",
    loading: "Загрузка...",
    errorLoading: "Не удалось загрузить профиль",
    tryAgain: "Попробовать снова",
  };

  const handleLogout = () => {
    clearAuthToken();
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pt-20">
        <div className="container mx-auto max-w-2xl">
          <Skeleton className="h-10 w-48 mb-6" />
          <Card className="shadow-lg mb-4">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{translations.errorLoading}</p>
            <Button onClick={() => window.location.reload()}>{translations.tryAgain}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">{translations.profile}</h1>

        <Card className="shadow-lg mb-4">
          <CardHeader>
            <CardTitle>{translations.personalInfo}</CardTitle>
            <CardDescription>{translations.profileDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">{translations.firstName}</Label>
                  <Input id="firstName" value={user.first_name || ""} disabled className="bg-gray-50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">{translations.lastName}</Label>
                  <Input id="lastName" value={user.last_name || ""} disabled className="bg-gray-50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{translations.phone}</Label>
                  <Input id="phone" value={user.phone_number || ""} disabled className="bg-gray-50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{translations.address}</Label>
                  <Input id="address" value={user.address || ""} disabled className="bg-gray-50" />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={handleLogout}
          variant="destructive"
          size="lg"
          className="w-full max-w-md flex items-center justify-center gap-2"
        >
          <LogOut className="h-5 w-5" />
          {translations.logout}
        </Button>
      </div>
    </div>
  );
}