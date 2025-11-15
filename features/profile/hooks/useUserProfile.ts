import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { userStore } from "../userStore";
import type { ProfileResponse, UpdateProfileRequest, UpdateProfileResponse } from "../types";

export const useUserProfile = () => {
  return useQuery<ProfileResponse["data"]>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await apiClient.get<ProfileResponse>("/profile");
      const userData = response.data.data;
      
      // Store'a kaydet
      userStore.setUser(userData);
      
      return userData;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateProfileResponse["data"], Error, UpdateProfileRequest>({
    mutationFn: async (profileData) => {
      const response = await apiClient.post<UpdateProfileResponse>("/profile", profileData);
      return response.data.data;
    },
    onSuccess: (data) => {
      userStore.setUser(data);
      queryClient.setQueryData(["user-profile"], data);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
};