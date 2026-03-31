import { FerrySearchParams } from "@/types/FerryBookingSession.types";

export class FerryCache {
  private static cache = new Map<string, { data: any; expiry: number }>();
  private static CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

  static get(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  static set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_DURATION,
    });
  }

  static generateKey(params: FerrySearchParams, operator: string): string {
    return `${operator}:${params.from}:${params.to}:${params.date}:${params.adults}:${params.children}`;
  }
}