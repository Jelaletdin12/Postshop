// lib/services/tokenStorage.ts

/**
 * Centralized token storage using localStorage only
 * Single source of truth for all token operations
 */

const AUTH_TOKEN_KEY = "authToken";
const GUEST_TOKEN_KEY = "guestToken";

class TokenStorage {
  private static isClient = typeof window !== "undefined";

  static getAuthToken(): string | null {
    if (!this.isClient) return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  static getGuestToken(): string | null {
    if (!this.isClient) return null;
    return localStorage.getItem(GUEST_TOKEN_KEY);
  }

  static getActiveToken(): string | null {
    return this.getAuthToken() || this.getGuestToken();
  }

  static setAuthToken(token: string): void {
    if (!this.isClient) return;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.removeItem(GUEST_TOKEN_KEY); 
  }

  static setGuestToken(token: string): void {
    if (!this.isClient) return;
    if (!this.getAuthToken()) {
      localStorage.setItem(GUEST_TOKEN_KEY, token);
    }
  }

  static clearTokens(): void {
    if (!this.isClient) return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(GUEST_TOKEN_KEY);
  }

  static hasAuthToken(): boolean {
    return !!this.getAuthToken();
  }

  static hasAnyToken(): boolean {
    return !!this.getActiveToken();
  }
}

export default TokenStorage;