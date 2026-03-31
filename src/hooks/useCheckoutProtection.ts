"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckoutStore } from '@/store/CheckoutStore';

interface UseCheckoutProtectionOptions {
  step: number;
  enabled?: boolean;
}

export const useCheckoutProtection = ({ 
  step, 
  enabled = true 
}: UseCheckoutProtectionOptions) => {
  const router = useRouter();
  const { formData, resetAfterBooking } = useCheckoutStore();
  const [showBeforeUnloadModal, setShowBeforeUnloadModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Check if user has form data that would be lost
  const hasUnsavedData = () => {
    if (!formData) return false;
    
    switch (step) {
      case 1:
        // Step 1: Check if any member details are filled
        return formData.members && formData.members.length > 0;
      case 2:
        // Step 2: Check if form data exists (user has progressed from step 1)
        return formData.members && formData.members.length > 0;
      case 3:
        // Step 3: Always protect confirmation page
        return true;
      default:
        return false;
    }
  };

  // Get contextual warning message based on step
  const getWarningMessage = () => {
    switch (step) {
      case 1:
        return "You'll lose all the passenger details you've entered. Are you sure you want to leave?";
      case 2:
        return "You'll lose your booking selection and all passenger information. Are you sure you want to leave?";
      case 3:
        return "Your booking confirmation details will be lost if you leave this page. Make sure to save your booking ID and confirmation details.";
      default:
        return "You have unsaved changes. Are you sure you want to leave?";
    }
  };

  // Handle browser beforeunload event and all navigation attempts
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedData()) {
        e.preventDefault();
        e.returnValue = getWarningMessage();
        return e.returnValue;
      }
    };

    // Intercept all link clicks to show confirmation modal
    const handleLinkClick = (e: MouseEvent) => {
      if (!hasUnsavedData()) return;

      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Check if it's an internal navigation (not external links)
      const isInternal = href.startsWith('/') || href.startsWith('#') || 
                        href.includes(window.location.origin);
      
      // Check if it's navigating away from checkout
      const isLeavingCheckout = !href.includes('/checkout');
      
      if (isInternal && isLeavingCheckout) {
        e.preventDefault();
        e.stopPropagation();
        setPendingNavigation(href);
        setShowBeforeUnloadModal(true);
      }
    };

    // Handle browser back/forward navigation
    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedData()) {
        const shouldLeave = window.confirm(getWarningMessage());
        if (!shouldLeave) {
          // Push current state back to prevent navigation
          window.history.pushState(null, '', window.location.pathname);
        } else {
          resetAfterBooking();
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleLinkClick, true);
    window.addEventListener("popstate", handlePopState);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleLinkClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [enabled, step, formData]);

  // Handle navigation attempts
  const handleNavigation = (path: string) => {
    if (!hasUnsavedData()) {
      // No data to lose, navigate directly
      router.push(path);
      return;
    }

    // Show confirmation modal
    setPendingNavigation(path);
    setShowBeforeUnloadModal(true);
  };

  // Handle modal responses
  const handleStayOnPage = () => {
    setShowBeforeUnloadModal(false);
    setPendingNavigation(null);
  };

  const handleLeavePage = () => {
    setShowBeforeUnloadModal(false);
    if (pendingNavigation) {
      resetAfterBooking();
      router.push(pendingNavigation);
    }
  };

  return {
    showBeforeUnloadModal,
    handleNavigation,
    handleStayOnPage,
    handleLeavePage,
    hasUnsavedData: hasUnsavedData(),
    warningMessage: getWarningMessage(),
  };
};
