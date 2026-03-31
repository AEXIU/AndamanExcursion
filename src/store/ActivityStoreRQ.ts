"use client";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";
import { nanoid } from "nanoid";
import { Activity } from "@payload-types";

export interface ActivitySearchParams {
  activityType: string;
  location: string;
  date: string;
  time: string;
  adults: number;
  children: number;
}

export interface CartItem {
  id: string; // Unique cart item ID
  activity: Activity;
  quantity: number;
  totalPrice: number;
  activityOptionId?: string;
  searchParams: ActivitySearchParams; // Store the search params for each item
  addedAt: string; // Timestamp when added
}

export interface FormOption {
  id: string;
  name: string;
  slug: string;
  value: string;
  label: string;
}

export interface TimeSlotOption extends FormOption {
  time: string;
}

// export interface FormOptions {
//   locations: FormOption[];
//   timeSlots: TimeSlotOption[];
//   activityTypes: FormOption[];
//   isLoading: boolean;
//   error: string | null;
// }

// Simplified state for cart management only (data fetching handled by React Query)
interface ActivityStoreState {
  // Search state (minimal - React Query handles the actual data)
  searchParams: ActivitySearchParams;

  // Cart state
  cart: CartItem[];

  // Edit mode state
  editingItemId: string | null;
  editingSearchParams: ActivitySearchParams | null;
}

interface ActivityStoreActions {
  // Search actions
  updateSearchParams: (params: Partial<ActivitySearchParams>) => void;

  // Cart actions
  addToCart: (
    activity: Activity,
    quantity: number,
    activityOptionId?: string,
    customSearchParams?: ActivitySearchParams
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;

  // Edit actions
  startEditingItem: (cartItemId: string) => void;
  editItem: (
    cartItemId: string,
    newActivity: Activity,
    newQuantity: number,
    newActivityOptionId?: string
  ) => void;
  updateEditingSearchParams: (params: Partial<ActivitySearchParams>) => void;
  saveEditedItem: (
    cartItemId: string,
    newActivity?: Activity,
    newActivityOptionId?: string
  ) => void;
  cancelEditing: () => void;

  // Utility actions
  reset: () => void;

  // Computed values
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getTotalPassengers: () => number;
  getCartItemById: (cartItemId: string) => CartItem | undefined;
  isItemInCart: (activityId: string, activityOptionId?: string) => boolean;
}

type ActivityStoreRQ = ActivityStoreState & ActivityStoreActions;

// Helper functions
const generateCartItemId = () => nanoid(10);

function getTomorrow(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

const calculateTotalPrice = (
  activity: Activity,
  searchParams: ActivitySearchParams,
  activityOptionId?: string,
  quantity: number = 1
): number => {
  let basePrice = activity.coreInfo?.basePrice || 0;

  // If specific option is selected, use its price
  if (activityOptionId && activity.activityOptions?.length) {
    const selectedOption = activity.activityOptions.find(
      (opt) => opt.id === activityOptionId
    );
    if (selectedOption) {
      basePrice =
        selectedOption.discountedPrice || selectedOption.price || basePrice;
    }
  } else if (activity.coreInfo?.discountedPrice) {
    // Use discounted price if available
    basePrice = activity.coreInfo.discountedPrice;
  }

  // Calculate price per booking (adults only for activities)
  // COMMENTED OUT: Infants and children are not handled for activities
  const pricePerBooking = basePrice * searchParams.adults;

  return pricePerBooking * quantity;
};

// Initial state
const initialState: ActivityStoreState = {
  searchParams: {
    activityType: "",
    location: "",
    date: getTomorrow(),
    time: "",
    adults: 1,
    children: 0, // COMMENTED OUT: Children not supported for activities
  },
  cart: [],
  editingItemId: null,
  editingSearchParams: null,
};

// Create the modernized Zustand store
export const useActivityStoreRQ = create<ActivityStoreRQ>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // Search actions
      updateSearchParams: (params) => {
        set((state) => {
          Object.assign(state.searchParams, params);

          // If we're in edit mode, also update the editing search params
          if (state.editingItemId && state.editingSearchParams) {
            Object.assign(state.editingSearchParams, params);
          }
        });
      },

      // Cart actions
      addToCart: (activity, quantity, activityOptionId, customSearchParams) => {
        const searchParams = customSearchParams || get().searchParams;

        // Ensure time is set - if not, use a default time slot
        const finalSearchParams = {
          ...searchParams,
          time: searchParams.time || "09-00", // Default to 9:00 AM if no time selected
        };

        const cartItemId = generateCartItemId();
        const totalPrice = calculateTotalPrice(
          activity,
          finalSearchParams,
          activityOptionId,
          quantity
        );

        set((state) => {
          const newItem: CartItem = {
            id: cartItemId,
            activity,
            quantity,
            totalPrice,
            activityOptionId,
            searchParams: { ...finalSearchParams },
            addedAt: new Date().toISOString(),
          };

          state.cart.push(newItem);
        });
      },

      removeFromCart: (cartItemId) => {
        set((state) => {
          const index = state.cart.findIndex((item) => item.id === cartItemId);
          if (index !== -1) {
            state.cart.splice(index, 1);
          }
        });
      },

      updateCartQuantity: (cartItemId, quantity) => {
        set((state) => {
          const item = state.cart.find((item) => item.id === cartItemId);
          if (item) {
            item.quantity = quantity;
            item.totalPrice = calculateTotalPrice(
              item.activity,
              item.searchParams,
              item.activityOptionId,
              quantity
            );
          }
        });
      },

      clearCart: () => {
        set((state) => {
          state.cart = [];
        });
      },

      // Edit actions
      startEditingItem: (cartItemId) => {
        set((state) => {
          const item = state.cart.find(
            (cartItem) => cartItem.id === cartItemId
          );
          if (item) {
            state.editingItemId = cartItemId;
            state.editingSearchParams = { ...item.searchParams };
          }
        });
      },

      editItem: (cartItemId, newActivity, newQuantity, newActivityOptionId) => {
        set((state) => {
          const item = state.cart.find(
            (cartItem) => cartItem.id === cartItemId
          );
          if (item) {
            item.activity = newActivity;
            item.quantity = newQuantity;
            item.activityOptionId = newActivityOptionId;
            item.totalPrice = calculateTotalPrice(
              newActivity,
              item.searchParams,
              newActivityOptionId,
              newQuantity
            );
          }
        });
      },

      updateEditingSearchParams: (params) => {
        set((state) => {
          if (state.editingSearchParams) {
            Object.assign(state.editingSearchParams, params);
          }
        });
      },

      saveEditedItem: (cartItemId, newActivity, newActivityOptionId) => {
        set((state) => {
          const item = state.cart.find(
            (cartItem) => cartItem.id === cartItemId
          );
          if (item && state.editingSearchParams) {
            // Update search params if they changed
            item.searchParams = { ...state.editingSearchParams };

            // Update activity if provided
            if (newActivity) {
              item.activity = newActivity;
            }

            // Update activity option if provided
            if (newActivityOptionId !== undefined) {
              item.activityOptionId = newActivityOptionId;
            }

            // Recalculate total price
            item.totalPrice = calculateTotalPrice(
              item.activity,
              item.searchParams,
              item.activityOptionId,
              item.quantity
            );

            // Clear editing state
            state.editingItemId = null;
            state.editingSearchParams = null;
          }
        });
      },

      cancelEditing: () => {
        set((state) => {
          state.editingItemId = null;
          state.editingSearchParams = null;
        });
      },

      // Utility actions
      reset: () => {
        set((state) => {
          Object.assign(state, initialState);
        });
      },

      // Computed values
      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.totalPrice, 0);
      },

      getCartItemCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },

      getTotalPassengers: () => {
        const { cart } = get();
        return cart.reduce(
          (total, item) =>
            // COMMENTED OUT: Only adults counted for activities
            total + item.searchParams.adults,
          0
        );
      },

      getCartItemById: (cartItemId) => {
        return get().cart.find((item) => item.id === cartItemId);
      },

      isItemInCart: (activityId, activityOptionId) => {
        return get().cart.some(
          (item) =>
            item.activity.id === activityId &&
            item.activityOptionId === activityOptionId
        );
      },
    }))
  )
);

// Hook for easier usage with React Query integration
export const useActivityRQ = () => {
  const store = useActivityStoreRQ();

  return {
    // State
    searchParams: store.searchParams,
    cart: store.cart,
    editingItemId: store.editingItemId,
    editingSearchParams: store.editingSearchParams,

    // Actions
    updateSearchParams: store.updateSearchParams,
    addToCart: store.addToCart,
    removeFromCart: store.removeFromCart,
    updateCartQuantity: store.updateCartQuantity,
    clearCart: store.clearCart,
    startEditingItem: store.startEditingItem,
    editItem: store.editItem,
    updateEditingSearchParams: store.updateEditingSearchParams,
    saveEditedItem: store.saveEditedItem,
    cancelEditing: store.cancelEditing,
    reset: store.reset,

    // Computed values
    getCartTotal: store.getCartTotal,
    getCartItemCount: store.getCartItemCount,
    getTotalPassengers: store.getTotalPassengers,
    getCartItemById: store.getCartItemById,
    isItemInCart: store.isItemInCart,
  };
};

// Selectors for performance optimization
export const useSearchParamsRQ = () =>
  useActivityStoreRQ((state) => state.searchParams);

export const useCartRQ = () => useActivityStoreRQ((state) => state.cart);

export const useEditingStateRQ = () =>
  useActivityStoreRQ((state) => ({
    editingItemId: state.editingItemId,
    editingSearchParams: state.editingSearchParams,
  }));
