"use client";

import { useCallback, useMemo } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/lib/hooks";
import { clearAuthToken } from "@/lib/api";
import { useTranslations } from "next-intl";

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export default function ClientProfilePage(props: ProfilePageProps) {
  const { data: user, isLoading, error } = useUserProfile();
  const t = useTranslations();

  const handleLogout = useCallback(() => {
    clearAuthToken();
    window.location.href = "/";
  }, []);

  const loadingSkeleton = useMemo(() => (
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
  ), []);

  if (isLoading) {
    return loadingSkeleton;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{t("error_loading_profile")}</p>
            <Button onClick={() => window.location.reload()}>{t("try_again")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">{t("profile")}</h1>

        <Card className="shadow-lg mb-4">
          <CardHeader>
            <CardTitle>{t("personal_info")}</CardTitle>
            <CardDescription>{t("profile_description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("first_name")}</Label>
                  <Input id="firstName" value={user.first_name || ""} disabled className="bg-gray-50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("last_name")}</Label>
                  <Input id="lastName" value={user.last_name || ""} disabled className="bg-gray-50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("phone_number")}</Label>
                  <Input id="phone" value={user.phone_number || ""} disabled className="bg-gray-50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("address")}</Label>
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
          {t("common.logout")}
        </Button>
      </div>
    </div>
  );
}