// ==========================================
// ARCHIVED - REPLACED BY PHONEPE
// This file is kept for reference only
// Active payment processing now uses PhonePe
// See: src/hooks/usePhonePe.ts
// ==========================================

// "use client";
// import { useState, useCallback } from "react";

// // Extend Window interface for Razorpay
// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

// interface RazorpayOptions {
//   key: string;
//   amount: number;
//   currency: string;
//   name: string;
//   description?: string;
//   order_id: string;
//   handler: (response: any) => void;
//   prefill?: {
//     name?: string;
//     email?: string;
//     contact?: string;
//   };
//   notes?: Record<string, any>;
//   theme?: {
//     color?: string;
//   };
//   modal?: {
//     ondismiss?: () => void;
//   };
// }

// interface PaymentData {
//   amount: number;
//   bookingData: any;
//   customerDetails: {
//     name: string;
//     email: string;
//     phone: string;
//   };
//   sessionId?: string;
// }

// interface UseRazorpayReturn {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const clearError = useCallback(() => {
//     setError(null);

//   const loadRazorpayScript = useCallback((): Promise<boolean> => {
//     return new Promise((resolve) => {
//       if (window.Razorpay) {
//         resolve(true);
//         return;
//       }

//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   }, []);

//   const createOrder = useCallback(async (paymentData: PaymentData) => {
//     const response = await fetch("/api/payments/create-order", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         amount: paymentData.amount,
//         currency: "INR",
//         receipt: `receipt_${Date.now()}`,
//         bookingData: paymentData.bookingData,
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || "Failed to create payment order");
//     }

//     return response.json();
//   }, []);

//   const verifyPayment = useCallback(
//     async (paymentResponse: any, bookingData: any, sessionId?: string) => {
//       const response = await fetch("/api/payments/verify", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           razorpay_order_id: paymentResponse.razorpay_order_id,
//           razorpay_payment_id: paymentResponse.razorpay_payment_id,
//           razorpay_signature: paymentResponse.razorpay_signature,
//           bookingData,
//           sessionId,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Payment verification failed");
//       }

//       return response.json();
//     },
//     []
//   );

//   const initiatePayment = useCallback(
//     async (paymentData: PaymentData) => {
//       try {
//         setIsLoading(true);
//         setError(null);

//         // Load Razorpay script
//         const scriptLoaded = await loadRazorpayScript();
//         if (!scriptLoaded) {
//           throw new Error("Failed to load Razorpay SDK");
//         }

//         // Create order
//         const orderData = await createOrder(paymentData);
//         if (!orderData.success) {
//           throw new Error(orderData.error || "Failed to create payment order");
//         }

//         // Configure Razorpay options
//         const options: RazorpayOptions = {
//           key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
//           amount: orderData.order.amount,
//           currency: orderData.order.currency,
//           name: "Andaman Excursion",
//           description: `Booking for ${
//             paymentData.bookingData.activities?.length || 1
//           } activity(ies)`,
//           order_id: orderData.order.id,
//           handler: async (response: any) => {
//             try {
//               // Verify payment
//               const verificationResult = await verifyPayment(
//                 response,
//                 paymentData.bookingData,
//                 paymentData.sessionId
//               );

//               if (verificationResult.success) {
//                 // Payment successful - trigger success callback
//                 if (window.onPaymentSuccess) {
//                   window.onPaymentSuccess(verificationResult);
//                 }
//               } else {
//                 throw new Error("Payment verification failed");
//               }
//             } catch (verifyError) {
//               console.error("Payment verification error:", verifyError);
//               setError(
//                 verifyError instanceof Error
//                   ? verifyError.message
//                   : "Payment verification failed"
//               );

//               if (window.onPaymentError) {
//                 window.onPaymentError(verifyError);
//               }
//             } finally {
//               setIsLoading(false);
//             }
//           },
//           prefill: {
//             name: paymentData.customerDetails.name,
//             email: paymentData.customerDetails.email,
//             contact: paymentData.customerDetails.phone,
//           },
//           notes: {
//             booking_type: paymentData.bookingData.bookingType || "activity",
//             activity_count: paymentData.bookingData.activities?.length || 0,
//             passenger_count: paymentData.bookingData.members?.length || 0,
//           },
//           theme: {
//             color: "#3e8cff", // Your brand color
//           },
//           modal: {
//             ondismiss: () => {
//               setIsLoading(false);
//               setError("Payment cancelled by user");

//               if (window.onPaymentCancel) {
//                 window.onPaymentCancel();
//               }
//             },
//           },
//         };

//         // Open Razorpay checkout
//         const rzp = new window.Razorpay(options);
//         rzp.open();
//       } catch (error) {
//         console.error("Payment initiation error:", error);
//         setError(
//           error instanceof Error
//             ? error.message
//             : "Payment initialization failed"
//         );
//         setIsLoading(false);

//         if (window.onPaymentError) {
//           window.onPaymentError(error);
//         }
//       }
//     },
//     [loadRazorpayScript, createOrder, verifyPayment]
//   );

//   return {
//     initiatePayment,
//     isLoading,
//     error,
//     clearError,
//   };
// };

// // Extend Window interface for payment callbacks
// declare global {
//   interface Window {
//     onPaymentSuccess?: (result: any) => void;
//     onPaymentError?: (error: any) => void;
//     onPaymentCancel?: () => void;
//   }
// }
