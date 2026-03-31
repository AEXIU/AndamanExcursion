// "use client";
// import React from "react";
// import { Button } from "@/components/atoms/Button/Button";
// import { useRazorpay } from "@/hooks/useRazorpay";
// import { useCheckoutStore, useMembers } from "@/store/CheckoutStore";
// import styles from "./PaymentButton.module.css";

// interface PaymentButtonProps {
//   disabled?: boolean;
//   className?: string;
// }

// export const PaymentButton: React.FC<PaymentButtonProps> = ({
//   disabled = false,
//   className = "",
// }) => {
//   const { submitBooking, getTotalPrice, isLoading } = useCheckoutStore();
//   const members = useMembers();
//   const {
//     initiatePayment,
//     isLoading: paymentLoading,
//     error: paymentError,
//   } = useRazorpay();

//   const handlePayment = async () => {
//     try {
//       // First, prepare booking data
//       const bookingData = await submitBooking();

//       if (!bookingData) {
//         throw new Error("Failed to prepare booking data");
//       }

//       // Get primary member details for payment prefill
//       const primaryMember =
//         members.find((member) => member.isPrimary) || members[0];

//       if (!primaryMember) {
//         throw new Error("No member details found");
//       }

//       // Initiate Razorpay payment
//       await initiatePayment({
//         amount: getTotalPrice(),
//         bookingData,
//         customerDetails: {
//           name: primaryMember.fullName,
//           email: primaryMember.email || "",
//           phone: primaryMember.whatsappNumber || "",
//         },
//         sessionId: undefined, // Add session tracking if needed
//       });
//     } catch (error) {
//       console.error("Payment initiation failed:", error);
//       // Error handling is managed by the store and useRazorpay hook
//     }
//   };

//   const isProcessing = isLoading || paymentLoading;

//   return (
//     <div aria-label="Payment Button" className={styles.paymentButtonContainer}>
//       <Button
//         variant="primary"
//         size="large"
//         onClick={handlePayment}
//         disabled={disabled || isProcessing}
//         className={className}
//         loading={isProcessing}
//         showArrow
//         ariaLabel="Pay"
//       >
//         {isProcessing
//           ? "Processing..."
//           : `Pay ₹${getTotalPrice().toLocaleString()}`}
//       </Button>

//       {paymentError && (
//         <div className={styles.paymentError}>{paymentError}</div>
//       )}

//       <div className={styles.paymentInfo}>
//         <p>Secure payment powered by Razorpay</p>
//         <p>Supports UPI, Cards, Net Banking & Wallets</p>
//         <p>
//           <a
//             href="https://razorpay.com"
//             target="_blank"
//             rel="noopener noreferrer"
//             className={styles.paymentInfoLink}
//           >
//             Learn more about Razorpay
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default PaymentButton;
