"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

// Types
export interface MemberDetails {
  id: string;
  fullName: string;
  age: number | "";
  gender: "Male" | "Female" | "Other" | "";
  nationality: string;
  passportNumber?: string; // Optional since only foreign passengers need it
  whatsappNumber?: string;
  phoneCountryCode?: string; // NEW
  phoneCountry?: string; // NEW
  email?: string;
  isPrimary: boolean;
  selectedBookings: number[];
  // Foreign passenger fields for Makruzz (conditional based on nationality)
  fcountry?: string; // Country name for foreign passengers
  fpassport?: string; // Passport number for foreign passengers
  fexpdate?: string; // Passport expiry date for foreign passengers (YYYY-MM-DD)
}

export interface CheckoutFormData {
  members: MemberDetails[];
  termsAccepted: boolean;
}

export interface BookingConfirmation {
  bookingId: string;
  confirmationNumber: string;
  bookingDate: string;
  status: "confirmed" | "pending" | "failed";
  paymentStatus: "paid" | "pending" | "failed";
  successMessage?: string;
  errorMessage?: string;
  providerBooking?: {
    success: boolean;
    providerBookingId?: string;
    error?: string;
    errorType?: string;
    pnr?: string;
  };
  // Full booking details from database
  fullBookingData?: any;
  pdfUrl?: string;
}

export interface CheckoutSession {
  id: string;
  formData: CheckoutFormData | null;
  currentStep: number;
  createdAt: string;
  expiresAt: string;
}

// State interface
interface CheckoutState {
  currentStep: number;
  formData: CheckoutFormData | null;
  isLoading: boolean;
  error: string | null;
  bookingConfirmation: BookingConfirmation | null;
  sessionId: string | null;
}

// Actions interface
interface CheckoutActions {
  // Navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Form management
  updateFormData: (formData: CheckoutFormData) => void;
  getFormData: () => CheckoutFormData | null;

  // UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Confirmation
  setBookingConfirmation: (confirmation: BookingConfirmation) => void;

  // Session management
  initializeSession: () => void;
  clearSession: () => void;
  isSessionExpired: () => boolean;
  cleanupOrphanedSessions: () => void; // Added this missing method

  // Utility
  reset: () => void;
  resetAfterBooking: () => void;
}

type CheckoutStore = CheckoutState & CheckoutActions;

// Initial state
const initialState: CheckoutState = {
  currentStep: 1,
  formData: null,
  isLoading: false,
  error: null,
  bookingConfirmation: null,
  sessionId: null,
};

// Utility functions
const generateSessionId = (): string => {
  return `checkout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const isSessionExpired = (expiresAt: string): boolean => {
  try {
    return new Date(expiresAt) < new Date();
  } catch (error) {
    console.error("Error checking session expiry:", error);
    return true;
  }
};

const createSession = (
  formData: CheckoutFormData | null,
  currentStep: number
): CheckoutSession => {
  const now = new Date();
  const expiryTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

  return {
    id: generateSessionId(),
    formData,
    currentStep,
    createdAt: now.toISOString(),
    expiresAt: expiryTime.toISOString(),
  };
};

// Generate unique member ID
const generateMemberId = (): string => {
  return `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create default form data based on passenger requirements
export const createDefaultFormData = (
  totalPassengers: number
): CheckoutFormData => {
  const members: MemberDetails[] = [];

  for (let i = 0; i < totalPassengers; i++) {
    members.push({
      id: generateMemberId(),
      fullName: "",
      age: "", // Empty by default - user must select
      gender: "",
      nationality: "Indian",
      passportNumber: undefined,
      whatsappNumber: i === 0 ? "" : undefined, // Only primary gets contact fields
      phoneCountryCode: i === 0 ? "+91" : undefined, // NEW
      phoneCountry: i === 0 ? "India" : undefined, // NEW
      email: i === 0 ? "" : undefined,
      isPrimary: i === 0,
      selectedBookings: [0], // Assign to first booking by default
      // Initialize foreign passenger fields as empty
      fcountry: "",
      fpassport: "",
      fexpdate: "",
    });
  }

  return {
    members,
    termsAccepted: false,
  };
};

// Helper function to safely parse JSON
const safeJsonParse = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON parse error:", error);
    return null;
  }
};

// Helper function to safely access sessionStorage
const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error("SessionStorage getItem error:", error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error("SessionStorage setItem error:", error);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error("SessionStorage removeItem error:", error);
    }
  },
};

// Helper function to safely update session
const updateSession = (
  sessionId: string | null,
  formData: CheckoutFormData | null,
  currentStep: number
) => {
  if (typeof window === "undefined" || !sessionId) return;

  try {
    const session = createSession(formData, currentStep);
    const sessionKey = `checkout-session-${sessionId}`;
    safeSessionStorage.setItem(sessionKey, JSON.stringify(session));
  } catch (error) {
    console.error("Error updating session:", error);
  }
};

//  storage wrapper that handles errors gracefully
const createSafeStorage = () => {
  if (typeof window === "undefined") {
    return createJSONStorage(() => ({
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }));
  }

  const baseStorage = createJSONStorage(() => sessionStorage);

  // Ensure baseStorage is defined
  if (!baseStorage) {
    return createJSONStorage(() => ({
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }));
  }

  return {
    getItem: async (name: string) => {
      try {
        const result = await baseStorage.getItem(name);

        // Additional session validation - handle both sync and async results
        if (result && typeof result === "object" && "state" in result) {
          const stateObj = result as { state?: { sessionId?: string } };

          if (stateObj.state?.sessionId) {
            const sessionKey = `checkout-session-${stateObj.state.sessionId}`;
            const sessionData = safeSessionStorage.getItem(sessionKey);

            if (sessionData) {
              const session = safeJsonParse(sessionData);
              if (session?.expiresAt && isSessionExpired(session.expiresAt)) {
                console.log("Session expired, clearing storage");
                safeSessionStorage.removeItem(sessionKey);
                await baseStorage.removeItem(name);
                return null;
              }
            }
          }
        }

        return result;
      } catch (error) {
        console.error("Error reading from storage:", error);
        return null;
      }
    },
    setItem: baseStorage.setItem,
    removeItem: baseStorage.removeItem,
  };
};

// Zustand store
export const useCheckoutStore = create<CheckoutStore>()(
  // COMMENTED OUT: Persist middleware causing storage errors
  // persist(
    immer((set, get) => ({
      ...initialState,

      // === NAVIGATION ===
      setCurrentStep: (step: number) => {
        set((state) => {
          state.currentStep = step;
          // COMMENTED OUT: Session persistence disabled
          // updateSession(state.sessionId, state.formData, step);
        });
      },

      nextStep: () => {
        set((state) => {
          if (state.currentStep < 3) {
            state.currentStep += 1;
            // COMMENTED OUT: Session persistence disabled
            // updateSession(state.sessionId, state.formData, state.currentStep);
          }
        });
      },

      prevStep: () => {
        set((state) => {
          if (state.currentStep > 1) {
            state.currentStep -= 1;
            // COMMENTED OUT: Session persistence disabled
            // updateSession(state.sessionId, state.formData, state.currentStep);
          }
        });
      },

      // === FORM MANAGEMENT ===
      updateFormData: (formData: CheckoutFormData) => {
        set((state) => {
          state.formData = formData;
          // COMMENTED OUT: Session persistence disabled
          // updateSession(state.sessionId, formData, state.currentStep);
        });
      },

      getFormData: () => {
        return get().formData;
      },

      // === UI STATE ===
      setLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading;
        });
      },

      setError: (error: string | null) => {
        set((state) => {
          state.error = error;
        });
      },

      // === CONFIRMATION ===
      setBookingConfirmation: (confirmation: BookingConfirmation) => {
        set((state) => {
          state.bookingConfirmation = confirmation;
          state.currentStep = 3;
          // COMMENTED OUT: Session persistence disabled
          // updateSession(state.sessionId, state.formData, 3);
        });
      },

      // === SESSION MANAGEMENT (COMMENTED OUT) ===
      initializeSession: () => {
        // COMMENTED OUT: Session functionality disabled
        // if (typeof window === "undefined") return;
        // const sessionId = generateSessionId();
        // set((state) => {
        //   state.sessionId = sessionId;
        // });
        console.log("Session initialization disabled");
      },

      clearSession: () => {
        // COMMENTED OUT: Session storage operations disabled
        // if (typeof window === "undefined") return;
        // const { sessionId } = get();
        // if (sessionId) {
        //   safeSessionStorage.removeItem(`checkout-session-${sessionId}`);
        // }

        set((state) => {
          state.sessionId = null;
          state.formData = null;
          state.currentStep = 1;
          state.bookingConfirmation = null;
          state.error = null;
          state.isLoading = false;
        });
      },

      isSessionExpired: () => {
        // COMMENTED OUT: Always return true since sessions are disabled
        return true;
        // if (typeof window === "undefined") return true;
        // const { sessionId } = get();
        // if (!sessionId) return true;
        // try {
        //   const sessionData = safeSessionStorage.getItem(`checkout-session-${sessionId}`);
        //   if (!sessionData) return true;
        //   const session = safeJsonParse(sessionData);
        //   if (!session || !session.expiresAt) return true;
        //   return isSessionExpired(session.expiresAt);
        // } catch (error) {
        //   console.error("Error checking session expiry:", error);
        //   return true;
        // }
      },

      cleanupOrphanedSessions: () => {
        // COMMENTED OUT: Session cleanup disabled
        console.log("Session cleanup disabled");
        // if (typeof window === "undefined") return;
        // try {
        //   const allKeys = Object.keys(sessionStorage);
        //   const sessionKeys = allKeys.filter((key) => key.startsWith("checkout-session-"));
        //   let cleanedCount = 0;
        //   sessionKeys.forEach((key) => {
        //     try {
        //       const sessionData = sessionStorage.getItem(key);
        //       if (sessionData) {
        //         const session = safeJsonParse(sessionData);
        //         if (session?.expiresAt && isSessionExpired(session.expiresAt)) {
        //           sessionStorage.removeItem(key);
        //           cleanedCount++;
        //         }
        //       }
        //     } catch (error) {
        //       console.error(`Error cleaning up session ${key}:`, error);
        //       sessionStorage.removeItem(key);
        //       cleanedCount++;
        //     }
        //   });
        //   if (cleanedCount > 0) {
        //     console.log(`Cleaned up ${cleanedCount} orphaned sessions`);
        //   }
        // } catch (error) {
        //   console.error("Error during session cleanup:", error);
        // }
      },

      // === UTILITY ===
      reset: () => {
        // COMMENTED OUT: Session storage operations disabled
        // const { sessionId } = get();
        // if (sessionId) {
        //   safeSessionStorage.removeItem(`checkout-session-${sessionId}`);
        // }
        set(() => ({ ...initialState }));
      },

      resetAfterBooking: () => {
        // COMMENTED OUT: Session storage operations disabled
        // const { sessionId } = get();
        // if (sessionId) {
        //   safeSessionStorage.removeItem(`checkout-session-${sessionId}`);
        // }
        set(() => ({
          ...initialState,
          // COMMENTED OUT: No new session generation
          // sessionId: generateSessionId(),
        }));
      },
    }))
    // COMMENTED OUT: Persist middleware configuration causing storage errors
    // {
    //   name: "checkout-store",
    //   storage: undefined,
    //   version: 1,
    // }
);

// Selectors for performance
export const useCurrentStep = () =>
  useCheckoutStore((state) => state.currentStep);
export const useFormData = () =>
  useCheckoutStore((state) => state.formData);
export const useCheckoutLoading = () =>
  useCheckoutStore((state) => state.isLoading);
export const useCheckoutError = () =>
  useCheckoutStore((state) => state.error);
export const useBookingConfirmation = () =>
  useCheckoutStore((state) => state.bookingConfirmation);
export const useSessionId = () =>
  useCheckoutStore((state) => state.sessionId);
export const useIsSessionExpired = () =>
  useCheckoutStore((state) => state.isSessionExpired());

// Session management hooks
export const useCheckoutSession = () => {
  const store = useCheckoutStore();

  return {
    sessionId: store.sessionId,
    initializeSession: store.initializeSession,
    clearSession: store.clearSession,
    isSessionExpired: store.isSessionExpired,
    cleanupOrphanedSessions: store.cleanupOrphanedSessions,
    reset: store.reset,
    resetAfterBooking: store.resetAfterBooking,

    ensureValidSession: () => {
      if (!store.sessionId || store.isSessionExpired()) {
        store.initializeSession();
      }
    },

    // Clean up sessions when component unmounts or user navigates away
    cleanup: () => {
      store.cleanupOrphanedSessions();
    },

    // ADDED: Complete reset for new bookings with cross-store cleanup
    resetForNewBooking: () => {
      // 1. Reset checkout store
      store.resetAfterBooking();

      // COMMENTED OUT: URL parameter clearing disabled
      // if (typeof window !== "undefined") {
      //   const url = new URL(window.location.href);
      //   url.search = ""; // Clear all search params
      //   window.history.replaceState({}, "", url.pathname);
      // }

      console.log("Complete reset for new booking completed");
    },
  };
};
