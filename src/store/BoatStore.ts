"use client";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";
import { nanoid } from "nanoid";
// Boat search params similar to activities
export interface BoatSearchParams {
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  adults: number;
  children: number;
}

// Simple boat object type for cart (can be from API or static data)
export interface Boat {
  id: string;
  route: {
    id: string;
    from: string;
    to: string;
    fare: number;
    timing?: string[];
    minTimeAllowed?: string;
    description?: string;
  };
  name?: string;
  description?: string;
  fare: number;
  timing: string[];
  minTimeAllowed: string;
  capacity?: number;
  operator?: string;
}

// Cart item for boats
export interface BoatCartItem {
  id: string;
  boat: Boat;
  quantity: number;
  totalPrice: number;
  searchParams: BoatSearchParams;
  selectedTime: string;
  addedAt: string;
}

// Simplified state for cart management only
interface BoatStoreState {
  // Search state
  searchParams: BoatSearchParams;

  // Cart state
  cart: BoatCartItem[];

  // Edit mode state
  editingItemId: string | null;
  editingSearchParams: BoatSearchParams | null;
}

interface BoatStoreActions {
  // Search actions
  updateSearchParams: (params: Partial<BoatSearchParams>) => void;

  // Cart actions
  addToCart: (
    boat: Boat,
    quantity: number,
    selectedTime: string,
    customSearchParams?: BoatSearchParams
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;

  // Edit actions
  startEditingItem: (cartItemId: string) => void;
  editItem: (
    cartItemId: string,
    newBoat: Boat,
    newQuantity: number,
    newSelectedTime: string
  ) => void;
  updateEditingSearchParams: (params: Partial<BoatSearchParams>) => void;
  saveEditedItem: (
    cartItemId: string,
    newBoat?: Boat,
    newSelectedTime?: string
  ) => void;
  cancelEditing: () => void;

  // Utility actions
  reset: () => void;

  // Computed values
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getTotalPassengers: () => number;
  getCartItemById: (cartItemId: string) => BoatCartItem | undefined;
  isItemInCart: (boatId: string, selectedTime: string) => boolean;
}

type BoatStore = BoatStoreState & BoatStoreActions;

// Helper functions
const generateCartItemId = () => nanoid(10);

function getTomorrow(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

const calculateTotalPrice = (
  boat: Boat,
  searchParams: BoatSearchParams,
  quantity: number = 1
): number => {
  const baseFare = boat.fare || boat.route.fare;

  // Calculate price per booking (adults + children with 50% discount for children)
  const pricePerBooking =
    baseFare * searchParams.adults + baseFare * searchParams.children * 0.5;

  return pricePerBooking * quantity;
};

// Initial state
const initialState: BoatStoreState = {
  searchParams: {
    fromLocation: "",
    toLocation: "",
    date: getTomorrow(),
    time: "",
    adults: 1,
    children: 0,
  },
  cart: [],
  editingItemId: null,
  editingSearchParams: null,
};

// Create the Zustand store
export const useBoatStore = create<BoatStore>()(
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
      addToCart: (boat, quantity, selectedTime, customSearchParams) => {
        const searchParams = customSearchParams || get().searchParams;

        // Ensure time is set
        const finalSearchParams = {
          ...searchParams,
          time: selectedTime,
        };

        const cartItemId = generateCartItemId();
        const totalPrice = calculateTotalPrice(
          boat,
          finalSearchParams,
          quantity
        );

        set((state) => {
          const newItem: BoatCartItem = {
            id: cartItemId,
            boat,
            quantity,
            totalPrice,
            selectedTime,
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
              item.boat,
              item.searchParams,
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

      editItem: (cartItemId, newBoat, newQuantity, newSelectedTime) => {
        set((state) => {
          const item = state.cart.find(
            (cartItem) => cartItem.id === cartItemId
          );
          if (item) {
            item.boat = newBoat;
            item.quantity = newQuantity;
            item.selectedTime = newSelectedTime;
            item.totalPrice = calculateTotalPrice(
              newBoat,
              item.searchParams,
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

      saveEditedItem: (cartItemId, newBoat, newSelectedTime) => {
        set((state) => {
          const item = state.cart.find(
            (cartItem) => cartItem.id === cartItemId
          );
          if (item && state.editingSearchParams) {
            // Update search params if they changed
            item.searchParams = { ...state.editingSearchParams };

            // Update boat if provided
            if (newBoat) {
              item.boat = newBoat;
            }

            // Update selected time if provided
            if (newSelectedTime !== undefined) {
              item.selectedTime = newSelectedTime;
            }

            // Recalculate total price
            item.totalPrice = calculateTotalPrice(
              item.boat,
              item.searchParams,
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
            total + item.searchParams.adults + item.searchParams.children,
          0
        );
      },

      getCartItemById: (cartItemId) => {
        return get().cart.find((item) => item.id === cartItemId);
      },

      isItemInCart: (boatId, selectedTime) => {
        return get().cart.some(
          (item) =>
            item.boat.id === boatId && item.selectedTime === selectedTime
        );
      },
    }))
  )
);

// Expose store for checkout adapter access
if (typeof window !== "undefined") {
  (window as any).__BOAT_STORE__ = useBoatStore.getState();

  // Subscribe to updates
  useBoatStore.subscribe((state) => {
    (window as any).__BOAT_STORE__ = state;
  });
}

// Hook for easier usage
export const useBoat = () => {
  const store = useBoatStore();

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
export const useBoatSearchParams = () =>
  useBoatStore((state) => state.searchParams);

export const useBoatCart = () => useBoatStore((state) => state.cart);

export const useBoatEditingState = () =>
  useBoatStore((state) => ({
    editingItemId: state.editingItemId,
    editingSearchParams: state.editingSearchParams,
  }));
