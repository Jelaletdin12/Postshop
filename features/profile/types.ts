export interface UserProfile {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
}

export interface ProfileResponse {
  message: string;
  data: UserProfile;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
}

export interface UpdateProfileResponse {
  message: string;
  data: UserProfile;
}