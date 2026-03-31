/**
 * Booking Ticket PDF Component
 * REDESIGNED to match client's reference PDF exactly
 *
 * Structure:
 * 1. Hero header with tropical beach image
 * 2. Blue booking ID banner
 * 3. Booking details table + QR code
 * 4. Itinerary details with ferry logo
 * 5. Guest details table
 * 6. Price details
 * 7. Remark section
 * 8. Terms & conditions
 * 9. "Check our activities" section with images
 * 10. Contact footer
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { BookingTicketPDFProps } from "./types/booking.types";
import {
  COMPANY_LOGO_WHITE,
  HEADER_HERO_IMAGE,
  DEFAULT_ACTIVITIES,
  getFerryLogo,
} from "./constants/pdfImages";
import { getTermsForProvider } from "./constants/ferryTermsConstants";

// PDF Styles matching client's reference design
const styles = StyleSheet.create({
  page: {
    padding: 0,
    paddingTop: 20, // Add space at the top of new pages
    paddingBottom: 30, // Add space at the bottom of each page
    fontSize: 8,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },

  // ===== HEADER SECTION =====
  heroHeader: {
    position: "relative",
    height: 140,
    marginBottom: 0,
    backgroundColor: "#0A7C9E", // Fallback tropical blue-green color
  },
  heroImage: {
    width: "100%",
    height: 140,
    objectFit: "cover",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 82, 124, 0.4)", // Teal overlay matching tropical theme
  },
  topBar: {
    position: "absolute",
    top: 10,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactInfo: {
    fontSize: 7.5,
    color: "#FFFFFF",
    fontWeight: "normal",
  },
  topBookingId: {
    fontSize: 7.5,
    color: "#FFFFFF",
  },
  companyLogoContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  companyLogo: {
    width: 180,
    height: 55,
  },

  // ===== BOOKING ID BANNER =====
  bookingIdBanner: {
    backgroundColor: "#4A9FDB", // Lighter blue matching reference exactly
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 0,
  },
  bookingIdText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 1,
  },

  // ===== BOOKING DETAILS + QR CODE SECTION =====
  bookingDetailsSection: {
    flexDirection: "row",
    marginHorizontal: 30,
    marginBottom: 12,
  },
  bookingDetailsTable: {
    flex: 1,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#000000",
  },
  detailRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    minHeight: 22,
    alignItems: "center",
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    width: "50%",
    padding: 5,
    fontSize: 7.5,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#000000",
  },
  detailValue: {
    width: "50%",
    padding: 5,
    fontSize: 7.5,
  },
  qrCodeContainer: {
    width: 110,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#000000",
    padding: 8,
  },
  qrCode: {
    width: 94,
    height: 94,
  },

  // ===== ITINERARY SECTION =====
  sectionContainer: {
    marginHorizontal: 30,
    marginBottom: 15, // Increased from 12 for better spacing
    marginTop: 5, // Add top margin for breathing room
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000000",
  },
  itineraryContent: {
    borderWidth: 1,
    borderColor: "#000000",
  },
  ferryLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the logo horizontally
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    backgroundColor: "#FAFAFA",
  },
  ferryLogo: {
    width: 110,
    height: 32,
    objectFit: "contain",
  },
  itineraryTableHeader: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  itineraryTableRow: {
    flexDirection: "row",
  },
  itineraryCell: {
    padding: 5,
    fontSize: 7.5,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    textAlign: "center",
  },
  itineraryCellLast: {
    borderRightWidth: 0,
  },
  itineraryCellHeader: {
    fontWeight: "bold",
  },
  columnFrom: { width: "18%" },
  columnTo: { width: "18%" },
  columnDeparture: { width: "12%" },
  columnArrival: { width: "12%" },
  columnVessel: { width: "20%" },
  columnClass: { width: "12%" },
  columnStatus: { width: "8%" },

  // ===== GUEST DETAILS TABLE =====
  guestTableHeader: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#000000",
    borderBottomWidth: 1,
  },
  guestTableRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000000",
    borderTopWidth: 0,
  },
  guestCell: {
    padding: 5,
    fontSize: 7.5,
    borderRightWidth: 1,
    borderRightColor: "#000000",
  },
  guestCellLast: {
    borderRightWidth: 0,
  },
  guestCellHeader: {
    fontWeight: "bold",
  },
  guestColumnName: { width: "22%" },
  guestColumnNationality: { width: "12%" },
  guestColumnPassport: { width: "18%" },
  guestColumnTicket: { width: "13%" },
  guestColumnGender: { width: "8%" },
  guestColumnSeat: { width: "12%" },
  guestColumnStatus: { width: "15%" },

  // ===== PRICE DETAILS =====
  priceDetailsContainer: {
    borderWidth: 1,
    borderColor: "#000000",
    padding: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  priceLeft: {
    flexDirection: "row",
    width: "48%",
  },
  priceRight: {
    flexDirection: "row",
    width: "52%",
  },
  priceLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    width: 95,
  },
  priceValue: {
    fontSize: 7.5,
    width: 55,
  },
  priceRightLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    width: 135,
    marginLeft: 15,
  },
  priceRightValue: {
    fontSize: 7.5,
  },
  priceDivider: {
    borderTopWidth: 1,
    borderTopColor: "#000000",
    marginVertical: 6,
  },
  totalRow: {
    flexDirection: "row",
    marginTop: 3,
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: "bold",
    width: 95,
  },
  totalValue: {
    fontSize: 9,
    fontWeight: "bold",
  },

  // ===== REMARK SECTION =====
  remarkSection: {
    padding: 10,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  remarkText: {
    fontSize: 7.5,
    fontStyle: "italic",
  },

  // ===== TERMS & CONDITIONS =====
  termsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#CCCCCC",
    borderTopStyle: "dashed",
    paddingTop: 8,
    paddingBottom: 10, // Add bottom padding for spacing
  },
  termsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 6,
  },
  termItem: {
    fontSize: 6,
    lineHeight: 1.3,
    marginBottom: 2.5,
  },

  // ===== ACTIVITIES SECTION =====
  activitiesSection: {
    marginHorizontal: 30,
    marginTop: 25, // Increased from 15 for more space after terms
    marginBottom: 20, // Increased from 15 for space before footer
  },
  activitiesTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4A9FDB",
    marginBottom: 10,
  },
  activitiesGrid: {
    flexDirection: "row",
    gap: 12,
  },
  activityCard: {
    flex: 1,
    position: "relative",
    borderRadius: 6,
    overflow: "hidden",
  },
  activityImage: {
    width: "100%",
    height: 110,
    objectFit: "cover",
  },
  activityLogoOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  activityMiniLogo: {
    width: 60,
    height: 18,
  },
  activityInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent", // Removed black background as requested
    padding: 10,
  },
  activityTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 3,
    textShadow: "0px 2px 4px rgba(0, 0, 0, 0.8)", // Add text shadow for readability on transparent background
  },
  activityPrice: {
    fontSize: 8.5,
    color: "#FFFFFF",
    textShadow: "0px 2px 4px rgba(0, 0, 0, 0.8)", // Add text shadow for readability
  },

  // ===== ACTIVITIES BOOKING STYLES =====
  activityBookingItem: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  activityBookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF5E6",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  activityBookingTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000000",
  },
  activityBookingType: {
    fontSize: 7.5,
    color: "#666666",
  },
  activityDetailsTable: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  activityDetailCell: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  activityDetailCellLast: {
    borderRightWidth: 0,
  },
  activityDetailLabel: {
    fontSize: 7,
    color: "#666666",
    marginBottom: 3,
  },
  activityDetailValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000000",
  },

  // ===== GUEST INFORMATION (ACTIVITIES) =====
  guestInfoSection: {
    marginTop: 15,
  },
  guestInfoTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 10,
  },
  guestInfoCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    padding: 10,
  },
  guestInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  guestInfoName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000000",
  },
  guestInfoAge: {
    fontSize: 7.5,
    color: "#666666",
  },
  guestInfoRow: {
    flexDirection: "row",
    marginTop: 5,
  },
  guestInfoField: {
    flex: 1,
  },
  guestInfoFieldLabel: {
    fontSize: 6.5,
    color: "#666666",
    marginBottom: 2,
  },
  guestInfoFieldValue: {
    fontSize: 7.5,
    color: "#000000",
  },

  // ===== FOOTER =====
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#000000",
  },
  footerLeft: {
    fontSize: 8.5,
    fontWeight: "bold",
  },
  footerRight: {
    fontSize: 8.5,
    fontWeight: "bold",
  },
});

// Main Component
const BookingTicketPDFNew: React.FC<BookingTicketPDFProps> = ({ data, qrCodeUrl }) => {
  // Extract booking data
  const {
    bookingId,
    confirmationNumber,
    bookingDate,
    customerInfo,
    bookedFerries = [],
    bookedBoats = [],
    bookedActivities = [],
    passengers = [],
    pricing,
  } = data;

  // Determine booking type
  const isFerryBooking = bookedFerries.length > 0;
  const isBoatBooking = bookedBoats.length > 0;
  const isActivityBooking = bookedActivities.length > 0;

  // Get first ferry for main itinerary display
  const mainFerry = bookedFerries[0];
  const mainBoat = bookedBoats[0];

  const ferryOperator = mainFerry?.operator || mainFerry?.ferryName || "Ferry Service";
  const ferryLogo = getFerryLogo(ferryOperator);

  // Get PNR from ferry provider or use confirmation number for boats
  const providerPNR = mainFerry?.providerBooking?.pnr || confirmationNumber;

  // Format dates
  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format date for activities (e.g., "Sun, 06 Apr, 2025")
  const formatActivityDate = (date: string | Date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format time for activities (e.g., "10-00" -> "10:00 AM")
  const formatActivityTime = (time?: string) => {
    if (!time) return "N/A";
    // Handle format "10-00" or "10:00"
    const cleanTime = time.replace("-", ":");
    const [hours, minutes] = cleanTime.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return time;

    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Get seat number for a passenger
  const getSeatNumber = (passengerName: string, passengerIndex: number): string => {
    // Boats don't have seat assignments
    if (isBoatBooking) {
      return "N/A";
    }

    // For other operators, get seat by index since passengerName in selectedSeats is often empty
    const selectedSeats = mainFerry?.selectedSeats || [];

    // First try to find by passenger name if available
    const seatByName = selectedSeats.find(
      seat => seat.passengerName && seat.passengerName.toLowerCase() === passengerName.toLowerCase()
    );

    if (seatByName) {
      return seatByName.seatNumber;
    }

    // Otherwise use index-based matching (seats are in same order as passengers)
    if (selectedSeats[passengerIndex]) {
      return selectedSeats[passengerIndex].seatNumber;
    }

    return "N/A";
  };

  // Get provider-specific terms based on booking type
  // If terms are already provided in data (from PDF extraction), use those
  // Otherwise, use specific terms for ferries, boats, or activities
  const terms = data.termsAndConditions && data.termsAndConditions.length > 0
    ? data.termsAndConditions
    : isFerryBooking
      ? getTermsForProvider(ferryOperator)
      : isActivityBooking
        ? [
            "1. Please arrive at the meeting point at least 15 minutes before the scheduled activity time.",
            "2. All participants must sign a waiver form before the activity begins.",
            "3. Activities may be cancelled or rescheduled due to weather conditions or safety concerns.",
            "4. Participants must meet the age, health, and fitness requirements for the activity.",
            "5. Follow all safety instructions provided by the activity coordinator.",
            "6. Refund and cancellation policies apply as per booking terms.",
          ]
        : [
            "1. Please arrive at the departure point at least 30 minutes before scheduled departure time.",
            "2. This ticket is non-transferable and must be presented at the time of boarding.",
            "3. Management reserves the right to cancel or reschedule trips due to weather conditions or other unforeseen circumstances.",
            "4. Passengers are advised to carry valid ID proof for verification.",
            "5. Refund and cancellation policies apply as per booking terms.",
          ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HERO HEADER WITH TROPICAL BEACH IMAGE */}
        <View style={styles.heroHeader}>
          {/* Background Image */}
          {HEADER_HERO_IMAGE && (
            <Image src={HEADER_HERO_IMAGE} style={styles.heroImage} />
          )}
          <View style={styles.heroOverlay} />

          {/* Top Contact Bar */}
          <View style={styles.topBar}>
            <Text style={styles.contactInfo}>
              Contact : +91-9933261956 I +91-9332908036 Email : andamanexcursion@gmail.com
            </Text>
            <Text style={styles.topBookingId}>
              Booking ID: {providerPNR}
            </Text>
          </View>

          {/* Centered Company Logo */}
          <View style={styles.companyLogoContainer}>
            {COMPANY_LOGO_WHITE && (
              <Image src={COMPANY_LOGO_WHITE} style={styles.companyLogo} />
            )}
          </View>
        </View>

        {/* BLUE BOOKING ID BANNER */}
        <View style={styles.bookingIdBanner}>
          <Text style={styles.bookingIdText}>
            Booking ID: {providerPNR}
          </Text>
        </View>

        {/* BOOKING DETAILS + QR CODE */}
        <View style={styles.bookingDetailsSection}>
          {/* Booking Details Table */}
          <View style={styles.bookingDetailsTable}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location :</Text>
              <Text style={styles.detailValue}>Agent</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Issued By :</Text>
              <Text style={styles.detailValue}>
                {customerInfo?.primaryContactName || "SYSTEM"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking Reference( PNR ) :</Text>
              <Text style={styles.detailValue}>{providerPNR}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date Of Issue :</Text>
              <Text style={styles.detailValue}>{formatDate(bookingDate)}</Text>
            </View>
            <View style={[styles.detailRow, styles.detailRowLast]}>
              <Text style={styles.detailLabel}>Date Of Travel :</Text>
              <Text style={styles.detailValue}>
                {formatDate(
                  mainFerry?.schedule?.travelDate ||
                  mainBoat?.schedule?.travelDate ||
                  bookingDate
                )}
              </Text>
            </View>
          </View>

          {/* QR Code */}
          <View style={styles.qrCodeContainer}>
            {qrCodeUrl && <Image src={qrCodeUrl} style={styles.qrCode} />}
          </View>
        </View>

        {/* ITINERARY DETAILS (for Ferry/Boat) OR BOOKING DETAILS (for Activities) */}
        {(isFerryBooking || isBoatBooking) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Itinerary Details :</Text>
            <View style={styles.itineraryContent}>
              {/* Ferry Logo (only for ferry bookings) */}
              {isFerryBooking && ferryLogo && (
                <View style={styles.ferryLogoRow}>
                  <Image src={ferryLogo} style={styles.ferryLogo} />
                </View>
              )}

              {/* Table Header */}
              <View style={styles.itineraryTableHeader}>
                <Text
                  style={[
                    styles.itineraryCell,
                    styles.columnFrom,
                    styles.itineraryCellHeader,
                  ]}
                >
                  From
                </Text>
                <Text
                  style={[
                    styles.itineraryCell,
                    styles.columnTo,
                    styles.itineraryCellHeader,
                  ]}
                >
                  To
                </Text>
                <Text
                  style={[
                    styles.itineraryCell,
                    styles.columnDeparture,
                    styles.itineraryCellHeader,
                  ]}
                >
                  Departure
                </Text>
                <Text
                  style={[
                    styles.itineraryCell,
                    styles.columnArrival,
                    styles.itineraryCellHeader,
                  ]}
                >
                  {isBoatBooking ? "Duration" : "Arrival"}
                </Text>
                <Text
                  style={[
                    styles.itineraryCell,
                    styles.columnVessel,
                    styles.itineraryCellHeader,
                  ]}
                >
                  Vessel
                </Text>
                <Text
                  style={[
                    styles.itineraryCell,
                    styles.columnClass,
                    styles.itineraryCellHeader,
                  ]}
                >
                  Class
                </Text>
                <Text
                  style={[
                    styles.itineraryCell,
                    styles.columnStatus,
                    styles.itineraryCellLast,
                    styles.itineraryCellHeader,
                  ]}
                >
                  Status
                </Text>
              </View>

              {/* Ferry Data Row */}
              {isFerryBooking && mainFerry && (
                <View style={styles.itineraryTableRow}>
                  <Text style={[styles.itineraryCell, styles.columnFrom]}>
                    {mainFerry.route?.from || "N/A"}
                  </Text>
                  <Text style={[styles.itineraryCell, styles.columnTo]}>
                    {mainFerry.route?.to || "N/A"}
                  </Text>
                  <Text style={[styles.itineraryCell, styles.columnDeparture]}>
                    {mainFerry.schedule?.departureTime || "N/A"}
                  </Text>
                  <Text style={[styles.itineraryCell, styles.columnArrival]}>
                    {mainFerry.schedule?.arrivalTime || "N/A"}
                  </Text>
                  <Text style={[styles.itineraryCell, styles.columnVessel]}>
                    {ferryOperator}
                  </Text>
                  <Text style={[styles.itineraryCell, styles.columnClass]}>
                    {mainFerry.selectedClass?.className || "N/A"}
                  </Text>
                  <Text
                    style={[
                      styles.itineraryCell,
                      styles.columnStatus,
                      styles.itineraryCellLast,
                    ]}
                  >
                    OK
                  </Text>
                </View>
              )}

              {/* Boat Data Row */}
              {isBoatBooking && mainBoat && (
                <View style={styles.itineraryTableRow}>
                  <Text style={[styles.itineraryCell, styles.columnFrom]}>
                    {mainBoat.route?.from || "N/A"}
                  </Text>
                  <Text style={[styles.itineraryCell, styles.columnTo]}>
                    {mainBoat.route?.to || "N/A"}
                  </Text>
                  <Text style={[styles.itineraryCell, styles.columnDeparture]}>
                    {mainBoat.schedule?.departureTime || "N/A"}
                  </Text>
                  <Text style={[styles.itineraryCell, styles.columnArrival]}>
                    {mainBoat.schedule?.duration || "N/A"}
                  </Text>
                  <Text style={[styles.itineraryCell, styles.columnVessel]}>
                    {mainBoat.boatName || "Local Boat"}
                  </Text>
                  <Text style={[styles.itineraryCell, styles.columnClass]}>
                    Standard
                  </Text>
                  <Text
                    style={[
                      styles.itineraryCell,
                      styles.columnStatus,
                      styles.itineraryCellLast,
                    ]}
                  >
                    OK
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* BOOKING DETAILS (for Activities) */}
        {isActivityBooking && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Booking Details</Text>
            {bookedActivities.map((activity, index) => (
              <View key={index} style={styles.activityBookingItem}>
                {/* Activity Header */}
                <View style={styles.activityBookingHeader}>
                  <Text style={styles.activityBookingTitle}>
                    {index + 1}. {activity.activity?.name || activity.activity?.title || "Activity"}
                  </Text>
                  <Text style={styles.activityBookingType}>
                    Type: {activity.activityOption || "N/A"}
                  </Text>
                </View>

                {/* Activity Details Table */}
                <View style={styles.activityDetailsTable}>
                  <View style={styles.activityDetailCell}>
                    <Text style={styles.activityDetailLabel}>Location</Text>
                    <Text style={styles.activityDetailValue}>
                      {activity.location?.name ||
                       (Array.isArray(activity.activity?.coreInfo?.location) &&
                        activity.activity.coreInfo.location.length > 0
                          ? activity.activity.coreInfo.location[0]?.name
                          : activity.activity?.coreInfo?.location?.name || "N/A")}
                    </Text>
                  </View>
                  <View style={styles.activityDetailCell}>
                    <Text style={styles.activityDetailLabel}>Time</Text>
                    <Text style={styles.activityDetailValue}>
                      {formatActivityTime(activity.scheduledTime)}
                    </Text>
                  </View>
                  <View style={styles.activityDetailCell}>
                    <Text style={styles.activityDetailLabel}>Date</Text>
                    <Text style={styles.activityDetailValue}>
                      {formatActivityDate(bookingDate)}
                    </Text>
                  </View>
                  <View style={[styles.activityDetailCell, styles.activityDetailCellLast]}>
                    <Text style={styles.activityDetailLabel}>Duration</Text>
                    <Text style={styles.activityDetailValue}>
                      {activity.activity?.coreInfo?.duration ||
                       activity.activity?.duration ||
                       "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* GUEST DETAILS (for Ferry/Boat) */}
        {(isFerryBooking || isBoatBooking) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Guest Details :</Text>
            <View>
              {/* Table Header */}
              <View style={styles.guestTableHeader}>
                <Text
                  style={[
                    styles.guestCell,
                    styles.guestColumnName,
                    styles.guestCellHeader,
                  ]}
                >
                  Name
                </Text>
                <Text
                  style={[
                    styles.guestCell,
                    styles.guestColumnNationality,
                    styles.guestCellHeader,
                  ]}
                >
                  Nationality
                </Text>
                <Text
                  style={[
                    styles.guestCell,
                    styles.guestColumnPassport,
                    styles.guestCellHeader,
                  ]}
                >
                  RAP/Passport No.
                </Text>
                <Text
                  style={[
                    styles.guestCell,
                    styles.guestColumnTicket,
                    styles.guestCellHeader,
                  ]}
                >
                  Ticket No.
                </Text>
                <Text
                  style={[
                    styles.guestCell,
                    styles.guestColumnGender,
                    styles.guestCellHeader,
                  ]}
                >
                  Gender
                </Text>
                <Text
                  style={[
                    styles.guestCell,
                    styles.guestColumnSeat,
                    styles.guestCellHeader,
                  ]}
                >
                  Seat No.
                </Text>
                <Text
                  style={[
                    styles.guestCell,
                    styles.guestColumnStatus,
                    styles.guestCellLast,
                    styles.guestCellHeader,
                  ]}
                >
                  Status
                </Text>
              </View>

              {/* Table Rows */}
              {passengers.map((passenger, index) => (
                <View key={index} style={styles.guestTableRow}>
                  <Text style={[styles.guestCell, styles.guestColumnName]}>
                    {index + 1}. {passenger.fullName}
                  </Text>
                  <Text
                    style={[styles.guestCell, styles.guestColumnNationality]}
                  >
                    {passenger.nationality || "INDIAN"}
                  </Text>
                  <Text style={[styles.guestCell, styles.guestColumnPassport]}>
                    {passenger.passportNumber || passenger.idNumber || "N/A"}
                  </Text>
                  <Text style={[styles.guestCell, styles.guestColumnTicket]}>
                    {passenger.ticketNumber || providerPNR}
                  </Text>
                  <Text style={[styles.guestCell, styles.guestColumnGender]}>
                    {passenger.gender?.toLowerCase() === "male"
                      ? "M"
                      : passenger.gender?.toLowerCase() === "female"
                        ? "F"
                        : passenger.gender?.toUpperCase()?.charAt(0) || "O"}
                  </Text>
                  <Text style={[styles.guestCell, styles.guestColumnSeat]}>
                    {getSeatNumber(passenger.fullName, index)}
                  </Text>
                  <Text
                    style={[
                      styles.guestCell,
                      styles.guestColumnStatus,
                      styles.guestCellLast,
                    ]}
                  >
                    OK
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* GUESTS INFORMATION (for Activities) */}
        {isActivityBooking && (
          <View style={styles.sectionContainer}>
            <Text style={styles.guestInfoTitle}>
              Guests Information ({passengers.length})
            </Text>
            {passengers.map((passenger, index) => (
              <View key={index} style={styles.guestInfoCard}>
                {/* Guest Header */}
                <View style={styles.guestInfoHeader}>
                  <Text style={styles.guestInfoName}>
                    {passenger.fullName}
                  </Text>
                  <Text style={styles.guestInfoAge}>
                    {passenger.age} years | {passenger.gender}
                  </Text>
                </View>

                {/* Guest Details */}
                <View style={styles.guestInfoRow}>
                  <View style={styles.guestInfoField}>
                    <Text style={styles.guestInfoFieldLabel}>Contact Number</Text>
                    <Text style={styles.guestInfoFieldValue}>
                      {passenger.whatsappNumber || customerInfo?.customerPhone || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.guestInfoField}>
                    <Text style={styles.guestInfoFieldLabel}>Mail ID</Text>
                    <Text style={styles.guestInfoFieldValue}>
                      {passenger.email || customerInfo?.customerEmail || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.guestInfoField}>
                    <Text style={styles.guestInfoFieldLabel}>Passport Number</Text>
                    <Text style={styles.guestInfoFieldValue}>
                      {passenger.passportNumber || passenger.idNumber || "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* PRICE DETAILS */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Price Details :</Text>
          <View style={styles.priceDetailsContainer}>
            {/* First Row */}
            <View style={styles.priceRow}>
              <View style={styles.priceLeft}>
                <Text style={styles.priceLabel}>Basic Fare :</Text>
                <Text style={styles.priceValue}>
                  {pricing?.subtotal || pricing?.baseFare || "N/A"}
                </Text>
              </View>
              <View style={styles.priceRight}>
                <Text style={styles.priceRightLabel}>HSN/SAC :</Text>
                <Text style={styles.priceRightValue}>
                  {pricing?.hsnCode || "N/A"}
                </Text>
              </View>
            </View>

            {/* Second Row */}
            <View style={styles.priceRow}>
              <View style={styles.priceLeft}>
                <Text style={styles.priceLabel}>UTGST @ 0% :</Text>
                <Text style={styles.priceValue}>
                  {pricing?.utgst || "0.00"}
                </Text>
              </View>
              <View style={styles.priceRight}>
                <Text style={styles.priceRightLabel}>Mode Of Payment :</Text>
                <Text style={styles.priceRightValue}>
                  {pricing?.paymentMode || "N/A"}
                </Text>
              </View>
            </View>

            {/* Third Row */}
            <View style={styles.priceRow}>
              <View style={styles.priceLeft}>
                <Text style={styles.priceLabel}>CGST @ 0% :</Text>
                <Text style={styles.priceValue}>
                  {pricing?.cgst || "0.00"}
                </Text>
              </View>
              <View style={styles.priceRight}>
                <Text style={styles.priceRightLabel}>Party :</Text>
                <Text style={styles.priceRightValue}></Text>
              </View>
            </View>

            {/* Fourth Row */}
            <View style={styles.priceRow}>
              <View style={styles.priceLeft}>
                <Text style={styles.priceLabel}>PSF :</Text>
                <Text style={styles.priceValue}>{pricing?.psf || "0"}</Text>
              </View>
              <View style={styles.priceRight}>
                <Text style={styles.priceRightLabel}>Refreshment Charge :</Text>
                <Text style={styles.priceRightValue}>0</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.priceDivider} />

            {/* Total Row */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total :</Text>
              <Text style={styles.totalValue}>
                {pricing?.totalAmount || "0"}.00
              </Text>
            </View>
          </View>
        </View>

        {/* REMARK */}
        <View style={styles.sectionContainer}>
          <View style={styles.remarkSection}>
            <Text style={styles.remarkText}>
              Remark: Online booking via Andaman Excursion
            </Text>
          </View>
        </View>

        {/* TERMS & CONDITIONS */}
        <View style={styles.sectionContainer}>
          <View style={styles.termsContainer}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            {terms.map((term, index) => (
              <Text key={index} style={styles.termItem}>
                {term}
              </Text>
            ))}
          </View>
        </View>

        {/* CHECK OUR ACTIVITIES */}
        <View style={styles.activitiesSection}>
          <Text style={styles.activitiesTitle}>Check our activities</Text>
          <View style={styles.activitiesGrid}>
            {DEFAULT_ACTIVITIES.map((activity, index) => (
              <View key={index} style={styles.activityCard}>
                {activity.image && (
                  <Image src={activity.image} style={styles.activityImage} />
                )}

                {/* Logo Overlay */}
                <View style={styles.activityLogoOverlay}>
                  {COMPANY_LOGO_WHITE && (
                    <Image
                      src={COMPANY_LOGO_WHITE}
                      style={styles.activityMiniLogo}
                    />
                  )}
                </View>

                {/* Activity Info Overlay */}
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityPrice}>{activity.price}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerLeft}>
            Contact : +91-9933261956 | +91-9332908036
          </Text>
          <Text style={styles.footerRight}>
            Email : andamanexcursion@gmail.com
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default BookingTicketPDFNew;
