"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { useFerryStore } from "@/store/FerryStore";
import { useFerryDetails } from "@/hooks/ferry/useFerryDetails";
import { useSeatSelection } from "@/hooks/ferry/useSeatSelection";
import { useSeatLayout } from "@/hooks/ferry/useSeatLayout";
import { useSeatPreference } from "@/hooks/ferry/useSeatPreference";
import {
  validateSeatSelection,
  canProceedToCheckout,
} from "@/utils/ferryValidation";
import {
  // requiresManualSelection,
  shouldLoadSeatLayoutAutomatically,
} from "@/utils/ferryOperatorLogic";
import { ClassSelection } from "@/components/ferry/ClassSelection";
import { SeatSelectionSection } from "@/components/ferry/SeatSelectionSection";
import { AlertCircle } from "lucide-react";
import styles from "./page.module.css";
import FerrySummary from "@/components/ferry/FerrySummary";

// default function FerryBookingDetailPage() {
//   // const params = useParams();
//   const router = useRouter();

//   // Client state from Zustand
//   const {
//     selectedFerry: ferry,
//     selectedClass,
//     // selectedSeats: storeSelectedSeats,
//     searchParams: ferrySearchParams,
//     selectClass,
//     // selectSeats,
//     // COMMENTED OUT: Booking session creation disabled
//     // createBookingSession,
//   } = useFerryStore();

//   // Custom hooks
//   const { ferry: ferryDetails, isLoading, error } = useFerryDetails();
//   const totalPassengers = ferrySearchParams.adults + ferrySearchParams.children;
//   const {
//     seatLayout,
//     isLoading: loadingSeatLayout,
//     loadSeatLayout,
//     refreshLayout,
//   } = useSeatLayout(ferry);
//   const { selectedSeats, handleSeatSelect, clearSelection } = useSeatSelection(
//     ferry,
//     totalPassengers,
//     seatLayout
//   );
//   const { preference, canChoosePreference, setPreference } =
//     useSeatPreference(ferry);

//   // Auto-load seat layout for operators that require it
//   useEffect(() => {
//     if (ferry && selectedClass && shouldLoadSeatLayoutAutomatically(ferry)) {
//       console.log(
//         "🔄 Auto-loading seat layout for",
//         ferry.operator,
//         selectedClass.name
//       );
//       loadSeatLayout(selectedClass.id);
//     }
//   }, [ferry, selectedClass, loadSeatLayout]);

//   const handleClassSelection = async (classData: any) => {
//     console.log("🎯 Class selected:", classData.name);
//     selectClass(classData);
//     clearSelection();

//     // Load seat layout for operators that require manual selection
//     if (ferry && shouldLoadSeatLayoutAutomatically(ferry)) {
//       console.log("🔄 Loading seat layout for class:", classData.name);
//       await loadSeatLayout(classData.id);
//     }
//   };

//   const handleProceedToCheckout = () => {
//     if (
//       !ferry ||
//       !canProceedToCheckout(
//         ferry,
//         selectedClass,
//         selectedSeats,
//         totalPassengers
//       )
//     ) {
//       const validation = validateSeatSelection(
//         selectedSeats,
//         totalPassengers,
//         ferry!
//       );
//       if (!validation.isValid && validation.message) {
//         alert(validation.message);
//       }
//       return;
//     }

//     console.log("✅ Proceeding to checkout with:", {
//       ferry: ferry.ferryName,
//       class: selectedClass?.name,
//       seats: selectedSeats,
//       passengers: totalPassengers,
//     });

//     // COMMENTED OUT: Booking session creation disabled
//     // createBookingSession();
//     router.push("/checkout?type=ferry");
//   };

//   // Listen for when user returns to this page (e.g., after booking)
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (!document.hidden && selectedClass && seatLayout) {
//         console.log("🔄 Page visible again, refreshing seat layout...");
//         refreshLayout();
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () =>
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, [selectedClass, seatLayout, refreshLayout]);

//   const handleBackToResults = () => {
//     router.back();
//   };

//   const handleManualSelected = () => {
//     if (selectedClass) {
//       console.log("👆 Manual selection chosen, loading seat layout...");
//       loadSeatLayout(selectedClass.id);
//     }
//   };

//   // Debug logging
//   useEffect(() => {
//     if (seatLayout) {
//       console.log("🪑 Seat layout updated:", {
//         totalSeats: seatLayout.seats.length,
//         availableSeats: seatLayout.seats.filter((s) => s.status === "available")
//           .length,
//         bookedSeats: seatLayout.seats.filter((s) => s.status === "booked")
//           .length,
//         selectedSeats: selectedSeats.length,
//       });
//     }
//   }, [seatLayout, selectedSeats]);

//   if (isLoading) {
//     return (
//       <main className={styles.main}>
//         <div className={styles.container}>
//           <div className={styles.loadingState}>
//             <div className={styles.spinner} />
//             <h2>Loading ferry details...</h2>
//             <p>Please wait while we prepare your booking options.</p>
//           </div>
//         </div>
//       </main>
//     );
//   }

//   if (error || !ferry) {
//     return (
//       <main className={styles.main}>
//         <div className={styles.container}>
//           <div className={styles.errorState}>
//             <AlertCircle className={styles.errorIcon} size={48} />
//             <h1>Ferry Not Found</h1>
//             <p>{error || "The ferry you're looking for could not be found."}</p>
//             <Button variant="primary" onClick={handleBackToResults}>
//               Back to Search Results
//             </Button>
//           </div>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className={styles.main}>
//       <div className={styles.container}>
//         <div className={styles.twoColumnLayout}>
//           <div className={styles.leftColumn}>
//             <ClassSelection
//               classes={ferry.classes}
//               selectedClass={selectedClass}
//               onClassSelect={handleClassSelection}
//             />

//             <SeatSelectionSection
//               ferry={ferry}
//               selectedClass={selectedClass}
//               seatLayout={seatLayout}
//               selectedSeats={selectedSeats}
//               onSeatSelect={handleSeatSelect}
//               isLoading={loadingSeatLayout}
//               preference={preference}
//               onPreferenceChange={setPreference}
//               onManualSelected={handleManualSelected}
//               passengers={totalPassengers}
//               onRefreshLayout={refreshLayout}
//             />
//           </div>

//           <div className={styles.rightColumn}>
//             <FerrySummary
//               ferry={ferry}
//               selectedClass={selectedClass}
//               selectedSeats={selectedSeats}
//               searchParams={ferrySearchParams}
//               onBack={handleBackToResults}
//               onCheckout={handleProceedToCheckout}
//             />
//             {/* <FerryHeader ferry={ferry} onBack={handleBackToResults} />

//             <BookingSummary
//               ferry={ferry}
//               selectedClass={selectedClass}
//               selectedSeats={selectedSeats}
//               searchParams={ferrySearchParams}
//               onCheckout={handleProceedToCheckout}
//             /> */}
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }

export { default } from "./SimplifiedFerryBookingPage";
