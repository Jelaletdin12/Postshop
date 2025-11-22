"use client"

import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"

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
  data?: any
}

const API_ENDPOINTS = {
  openStore: "forms/newsletter-subscription",
}

export function useOpenStore() {
  return useMutation<OpenStoreResponse, Error, OpenStoreData>({
    mutationFn: async (data: OpenStoreData) => {
      const formData = new FormData()
      formData.append("firstname", data.firstName)
      formData.append("lastname", data.lastName)
      formData.append("email", data.email)
      formData.append("phone", data.phone)
      formData.append("file", data.patentFile)

      const response = await apiClient.post<OpenStoreResponse>(
        API_ENDPOINTS.openStore,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      
      return response.data
    },
  })
}