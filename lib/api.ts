// lib/api.ts

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import TokenStorage from "./tokenStorage";

const localeToApiLang = (locale: string): string => {
  const mapping: Record<string, string> = { tm: "tk", ru: "ru" };
  return mapping[locale] || locale;
};

class APIClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com";
    console.log("API URL:", this.baseUrl);

    this.client = axios.create({
      baseURL: `${this.baseUrl}/api/v1`,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
        "Api-Token": process.env.NEXT_PUBLIC_API_TOKEN || "123",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = TokenStorage.getActiveToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add language parameter
        let lang = "tm";
        
        if (typeof window !== "undefined") {
          if ((window as any).i18n?.language) {
            lang = localeToApiLang((window as any).i18n.language);
          } else {
            const pathLocale = window.location.pathname.split("/")[1];
            if (pathLocale === "tm" || pathLocale === "ru") {
              lang = localeToApiLang(pathLocale);
            }
          }
        }

        const url = config.url || "";
        const separator = url.includes("?") ? "&" : "?";
        config.url = `${url}${separator}lang=${lang}`;

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.client(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const guestTokenResponse = await axios.post(
              `${this.baseUrl}/api/v1/auth/guest-token`,
              {},
              {
                headers: {
                  "Content-Type": "application/json",
                  "Api-Token": process.env.NEXT_PUBLIC_API_TOKEN || "123",
                },
              }
            );

            const newToken = guestTokenResponse.data?.token || guestTokenResponse.data?.data;
            
            if (newToken) {
              TokenStorage.setGuestToken(newToken);
              this.processQueue(null);
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError);
            TokenStorage.clearTokens();
            
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        if (
          error.response?.data &&
          typeof error.response.data === "string" &&
          error.response.data.includes("<!DOCTYPE html>")
        ) {
          return Promise.reject({
            ...error,
            response: {
              ...error.response,
              data: { message: "Server returned HTML instead of JSON" },
            },
          });
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });
    this.failedQueue = [];
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new APIClient();