"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { LogOut, Edit2, Save, X, User, Phone, MapPin } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile, useUpdateProfile } from "@/lib/hooks";

import { useLogout } from "@/lib/hooks/useAuth";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export default function ClientProfilePage(props: ProfilePageProps) {
  const { data: user, isLoading, error } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const t = useTranslations();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    phone_number: "",
    address: "",
  });

  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
      });
    }
  }, [user, isEditing]);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const handleLogout = useCallback(() => {
    logout();
    window.location.href = "/";
  }, []);

  const handleEdit = useCallback(() => {
    if (user) {
      setFormData({
        name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
      });
      setIsEditing(true);
    }
  }, [user]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error(t("name_required") || "Name is required");
      return;
    }

    const apiData = {
      name: formData.name.trim(),
      last_name: formData.last_name.trim(),
      phone_number: formData.phone_number.trim(),
      address: formData.address.trim(),
    };


    try {
      await updateProfile.mutateAsync(apiData);
      setIsEditing(false);
      toast.success(
        t("profile_updated_success") || "Profile updated successfully"
      );
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        t("profile_update_error") ||
        "Failed to update profile";
      toast.error(errorMessage);
      console.error("[Profile] Update error:", err);
    }
  }, [formData, updateProfile, t]);

  const handleInputChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const loadingSkeleton = useMemo(
    () => (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24">
        <div className=" mx-auto max-w-4xl">
          <div className="mb-6 sm:mb-8">
            <Skeleton className="h-8 sm:h-10 w-32 sm:w-40 mb-2" />
            <Skeleton className="h-4 w-48 sm:w-64" />
          </div>
          <Card className="shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 sm:h-11 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    ),
    []
  );

  if (isLoading) {
    return loadingSkeleton;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-sm">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-6 w-6 sm:h-7 sm:w-7 text-red-600" />
            </div>
            <p className="text-red-600 mb-4 text-sm sm:text-base">
              {t("error_loading_profile")}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto cursor-pointer"
            >
              {t("try_again")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 pb-20 sm:pb-24">
      <div className=" mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">
                {t("profile")}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {isEditing
                  ? t("edit_your_information")
                  : t("view_your_information")}
              </p>
            </div>
            <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <User className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <CardHeader className="border-b border-gray-100 pb-4 sm:pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl text-gray-900">
                  {t("personal_info")}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">
                  {t("profile_description")}
                </CardDescription>
              </div>
              {!isEditing && (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  className="self-start sm:self-center cursor-pointer border-gray-300 hover:bg-gray-50 text-gray-700 h-9"
                >
                  <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="text-sm">{t("edit")}</span>
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-5 sm:pt-6 space-y-4 sm:space-y-5">
            {user && (
              <>
                {/* Name Fields - Grid on larger screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                    >
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {t("first_name")}
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      disabled={!isEditing}
                      className={`h-10 sm:h-11 text-sm sm:text-base ${
                        isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}
                      placeholder={t("enter_first_name")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                    >
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {t("last_name")}
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.last_name}
                      onChange={(e) =>
                        handleInputChange("last_name", e.target.value)
                      }
                      disabled={!isEditing}
                      className={`h-10 sm:h-11 text-sm sm:text-base ${
                        isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}
                      placeholder={t("enter_last_name")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                    >
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      {t("phone_number")}
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone_number}
                      onChange={(e) =>
                        handleInputChange("phone_number", e.target.value)
                      }
                      disabled={!isEditing}
                      className={`h-10 sm:h-11 text-sm sm:text-base ${
                        isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}
                      placeholder={t("enter_phone_number")}
                    />
                  </div>
                  {/* Address Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                    >
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {t("address")}
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      disabled={!isEditing}
                      className={`h-10 sm:h-11 text-sm sm:text-base ${
                        isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}
                      placeholder={t("enter_address")}
                    />
                  </div>
                </div>

                {/* Action Buttons - Edit Mode */}
                {isEditing && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-5 border-t border-gray-100">
                    <Button
                      onClick={handleSave}
                      disabled={updateProfile.isPending}
                      className="w-full sm:flex-1 cursor-pointer bg-blue-600 hover:bg-blue-700 h-10 sm:h-11 text-sm sm:text-base font-medium shadow-sm"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfile.isPending
                        ? t("saving")
                        : t("save_changes")}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={updateProfile.isPending}
                      className="w-full sm:flex-1 cursor-pointer h-10 sm:h-11 text-sm sm:text-base font-medium border-gray-300 hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t("cancel")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleLogout}
            variant="destructive"
            size="lg"
            className="w-full cursor-pointer sm:w-auto sm:min-w-[280px] flex items-center justify-center gap-2 h-11 text-sm sm:text-base font-medium shadow-sm"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            {t("common.logout")}
          </Button>
        </div>
      </div>
    </div>
  );
}
