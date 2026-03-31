// src/app/(frontend)/checkout/components/ReviewStep/index.tsx
// PhonePe v2 Payment Integration - Iframe Checkout Flow
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button/Button";
import { AlertDialog } from "@/components/atoms/AlertDialog";
import { useCheckoutStore } from "@/store/CheckoutStore";
import { CheckoutAdapter } from "@/utils/CheckoutAdapter";
import type {
  UnifiedBookingData,
  PassengerRequirements,
} from "@/utils/CheckoutAdapter";
import styles from "./ReviewStep.module.css";
import { SectionTitle } from "@/components/atoms";
import {
  Ship,
  Target,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Armchair,
  Users,
  Phone,
  Mail,
  Loader2,
  Anchor,
} from "lucide-react";

// PhonePe v2 uses redirect flow (simple and reliable)etter UX

interface ReviewStepProps {
  bookingData: UnifiedBookingData;
  requirements: PassengerRequirements;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  bookingData,
  requirements,
}) => {
  const router = useRouter();
  const {
    formData,
    prevStep,
    setCurrentStep,
    setLoading,
    setError,
    setBookingConfirmation,
    isLoading,
  } = useCheckoutStore();
  
  // State for payment processing
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // PhonePe v2 uses redirect flow (iframe doesn't work reliably)
  
  // Initiate payment with redirect
  const handleProceedToPayment = async () => {
    await handleConfirmPayment();
  };

  // Create payment order and redirect to PhonePe
  const handleConfirmPayment = async () => {
    if (!formData) {
      setError("Form data not found");
      return;
    }

    try {
      setLoading(true);
      setIsProcessingPayment(true);
      setError(""); // Clear any previous errors

      // Prepare payment data using the adapter
      const paymentData = CheckoutAdapter.preparePaymentData(
        bookingData,
        formData
      );

      console.log("Proceeding to PhonePe v2 payment with data:", paymentData);

      // Step 1: Create PhonePe v2 order (server-side)
      const orderResponse = await fetch("/api/payments/phonepe/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentData.totalPrice,
          bookingData: paymentData,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Failed to create payment order");
      }

      console.log("PhonePe v2 order created successfully:", {
        merchantOrderId: orderResult.merchantOrderId,
        hasRedirectUrl: !!orderResult.redirectUrl,
      });

      // Step 2: Store order ID in sessionStorage for return page
      sessionStorage.setItem("phonepe_merchant_order_id", orderResult.merchantOrderId);
      sessionStorage.setItem("phonepe_booking_data", JSON.stringify(paymentData));
      
      // Step 3: Redirect to PhonePe payment page
      console.log("Redirecting to PhonePe...");
      
      // Small delay so user sees the loading state
      setTimeout(() => {
        window.location.href = orderResult.redirectUrl;
      }, 500);

    } catch (error) {
      console.error("Payment error:", error);
      setError(error instanceof Error ? error.message : "Payment failed");
      setLoading(false);
      setIsProcessingPayment(false);
    }
  };

  // No iframe handlers needed - using redirect flow

  if (!formData) {
    return (
      <div className={styles.errorState}>
        <h3>Form data not found</h3>
        <Button onClick={() => setCurrentStep(1)}>Go to Step 1</Button>
      </div>
    );
  }

  return (
    <div className={styles.reviewStep}>
      <div className={styles.header}>
        <SectionTitle
          text="Review Your Booking"
          headingLevel="h1"
          specialWord="Review"
        />
        <p>Almost there! Give your details a quick look</p>
      </div>

      {/* Booking Summary */}
      <div className={styles.bookingSummary}>
        <h3>Booking Summary</h3>
        <div className={styles.bookingItems}>
          {bookingData.items.map((item, index) => (
            <div key={item.id} className={styles.bookingItem}>
              <div className={styles.itemIcon}>
                {item.type === "ferry" ? (
                  <Ship color="var(--color-primary)" size={24} />
                ) : item.type === "boat" ? (
                  <Anchor color="var(--color-primary)" size={24} />
                ) : (
                  <Target size={24} />
                )}
              </div>
              <div className={styles.itemDetails}>
                <h4>{item.title}</h4>
                <div className={styles.itemMeta}>
                  <span>
                    <Calendar size={16} /> {item.date}
                  </span>
                  {item.time && (
                    <span>
                      <Clock size={16} /> {item.time}
                    </span>
                  )}
                  {item.location && (
                    <span>
                      <MapPin size={16} />
                      {Array.isArray(item.location)
                        ? item.location[0].name
                        : typeof item.location === "string"
                        ? item.location
                        : item.location.name || "Location"}
                    </span>
                  )}
                  {/* Ferry-specific details */}
                  {item.type === "ferry" && item.selectedClass && (
                    <span>
                      <Ticket size={16} /> {item.selectedClass.name}
                    </span>
                  )}
                  {item.type === "ferry" &&
                    item.selectedSeats &&
                    item.selectedSeats.length > 0 && (
                      <span>
                        <Armchair size={16} /> Seats:{" "}
                        {item.selectedSeats.join(", ")}
                      </span>
                    )}
                  {/* Boat-specific details */}
                  {item.type === "boat" && item.boat?.route && (
                    <span>
                      <MapPin size={16} /> {item.boat.route.from} →{" "}
                      {item.boat.route.to}
                    </span>
                  )}
                  {item.type === "boat" && item.boat?.minTimeAllowed && (
                    <span>
                      <Clock size={16} /> Duration: {item.boat.minTimeAllowed}
                    </span>
                  )}
                  <div className={styles.passengerInfo}>
                    <Users size={16} />
                    {item.passengers.adults} adults
                    {item.passengers.infants > 0 &&
                      ` ${item.passengers.infants} infants`}
                  </div>
                </div>
              </div>
              <div className={styles.itemPrice}>
                ₹{item.price.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.totalPrice}>
          <div className={styles.totalRow}>
            <span>Total Amount</span>
            <span>₹{bookingData.totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Passenger Details */}
      <div className={styles.passengerDetails}>
        <h3>Passenger Details</h3>
        <div className={styles.passengerList}>
          {formData.members.map((member, index) => (
            <div key={member.id} className={styles.passengerCard}>
              <div className={styles.passengerHeader}>
                <h4>
                  {member.isPrimary
                    ? "Primary Contact"
                    : `Passenger ${index + 1}`}
                </h4>
                <span className={styles.passengerAge}>Age {member.age}</span>
              </div>
              <div className={styles.passengerInfoGrid}>
                <div className={styles.passengerRow}>
                  <span>Name:</span>
                  <span>{member.fullName}</span>
                </div>
                <div className={styles.passengerRow}>
                  <span>Gender:</span>
                  <span>{member.gender}</span>
                </div>
                <div className={styles.passengerRow}>
                  <span>Nationality:</span>
                  <span>{member.nationality}</span>
                </div>
                <div className={styles.passengerRow}>
                  <span>Passport:</span>
                  <span>
                    {member.nationality !== "Indian"
                      ? member.fpassport || "Not provided"
                      : member.passportNumber || "Not required"}
                  </span>
                </div>
                {member.nationality !== "Indian" && member.fexpdate && (
                  <div className={styles.passengerRow}>
                    <span>Passport Expiry:</span>
                    <span>{member.fexpdate}</span>
                  </div>
                )}
                {member.nationality !== "Indian" && member.fcountry && (
                  <div className={styles.passengerRow}>
                    <span>Country:</span>
                    <span>{member.fcountry}</span>
                  </div>
                )}
                {member.isPrimary && (
                  <>
                    <div className={styles.passengerRow}>
                      <span>
                        <Phone size={16} /> WhatsApp:
                      </span>
                      <span>{member.whatsappNumber}</span>
                    </div>
                    <div className={styles.passengerRow}>
                      <span>
                        <Mail size={16} /> Email:
                      </span>
                      <span>{member.email}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <Button
          variant="outline"
          onClick={prevStep}
          className={styles.backButton}
          disabled={isLoading}
        >
          Back to Details
        </Button>
        <Button
          variant="primary"
          onClick={handleProceedToPayment}
          className={styles.paymentButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className={styles.spinner} />
              Processing Payment...
            </>
          ) : (
            `Proceed to Payment - ₹${bookingData.totalPrice.toLocaleString()}`
          )}
        </Button>
      </div>

      {/* Terms Notice */}
      <div className={styles.termsNotice}>
        <p>
          By proceeding to payment, you confirm that you have read and agree to
          our{" "}
          <a href="/terms" target="_blank">
            Terms and Conditions
          </a>{" "}
          and{" "}
          <a href="/privacy" target="_blank">
            Privacy Policy
          </a>
          .
        </p>
      </div>

      {/* PhonePe uses redirect flow - no iframe needed */}
    </div>
  );
};
