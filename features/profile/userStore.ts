import type { UserProfile } from "./types";

// In-memory store (session-based, no persistence)
class UserStore {
  private user: UserProfile | null = null;

  setUser(user: UserProfile | null) {
    this.user = user;
  }

  getUser(): UserProfile | null {
    return this.user;
  }

  clearUser() {
    this.user = null;
  }

  getOrderData(): { customer_name: string; customer_phone: string } | null {
    if (!this.user) return null;
    
    return {
      customer_name: `${this.user.first_name} ${this.user.last_name}`.trim(),
      customer_phone: this.user.phone_number,
    };
  }
}

export const userStore = new UserStore();