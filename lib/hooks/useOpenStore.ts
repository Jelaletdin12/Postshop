"use client"

import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/config/api-endpoints"

interface OpenStoreData {
  firstName: string
  lastName: string
  email: string
  phone: string
  patentFile: File
}

interface OpenStoreResponse {
  success: boolean
  message: string
}

export function useOpenStore() {
  return useMutation({
    mutationFn: async (data: OpenStoreData) => {
      const formData = new FormData()
      formData.append("first_name", data.firstName)
      formData.append("last_name", data.lastName)
      formData.append("email", data.email)
      formData.append("phone", data.phone)
      formData.append("patent_file", data.patentFile)

      const response = await apiClient.post<OpenStoreResponse>(API_ENDPOINTS.openStore, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    },
  })
}
