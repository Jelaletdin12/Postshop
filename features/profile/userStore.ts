import type { UserProfile } from "@/lib/types/api";

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

  getOrderData(): { customer_name: string; customer_phone: string, customer_last_name: string } | null {
    if (!this.user) return null;
    
    return {
      customer_name: this.user.first_name,
      customer_last_name: this.user.last_name,
      customer_phone: this.user.phone_number,
    };
  }
}

export const userStore = new UserStore();