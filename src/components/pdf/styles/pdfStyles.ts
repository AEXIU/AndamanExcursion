import { StyleSheet } from "@react-pdf/renderer";
import { COLORS } from "./colors";

export const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 8,
    fontFamily: "Helvetica",
    backgroundColor: COLORS.bg.primary,
  },
  
  // Header Section with Logo and QR Code
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    borderBottomStyle: "solid",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "center",
  },
  companyLogo: {
    width: 150,
    height: 40,
  },
  qrCode: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  qrLabel: {
    fontSize: 8,
    color: COLORS.text.secondary,
  },
  
  // Booking ID Section - FIXED: removed borderRadius or set it to 0
  bookingIdSection: {
    backgroundColor: COLORS.primary,
    padding: 8,
    marginBottom: 15,
  },
  bookingIdText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.text.inverse,
    textAlign: "center",
  },
  
  // Booking Details
  bookingDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  detailLabel: {
    fontWeight: "bold",
    marginRight: 5,
    width: 130,
  },
  detailValue: {
    marginRight: 30,
    minWidth: 100,
  },
  
  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderBottomStyle: "solid",
    marginBottom: 15,
  },
  
  // Section Titles - FIXED: removed borderRadius or set it to 0
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: 8,
    backgroundColor: COLORS.bg.secondary,
    padding: 4,
  },
  
  // Tables
  itineraryTable: {
    marginBottom: 20,
  },
  guestTable: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.border,
    padding: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomWidth: 0,
  },
  tableHeaderCell: {
    fontWeight: "bold",
    fontSize: 9,
    padding: 2,
  },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
  },
  tableRowAlt: {
    backgroundColor: COLORS.bg.secondary,
  },
  tableCell: {
    fontSize: 9,
    padding: 2,
  },
  
  // Price Table - FIXED: removed borderRadius or set it to 0
  priceTable: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
  },
  priceRow: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "center",
  },
  priceLabel: {
    width: 100,
    fontWeight: "bold",
  },
  priceValue: {
    width: 60,
    marginRight: 50,
  },
  priceHSN: {
    marginLeft: "auto",
    fontSize: 8,
    color: COLORS.text.secondary,
  },
  paymentLabel: {
    width: 120,
    marginLeft: 50,
  },
  paymentValue: {
    width: 60,
  },
  partyLabel: {
    width: 120,
    marginLeft: 50,
  },
  partyValue: {
    width: 60,
  },
  refreshmentLabel: {
    width: 120,
    marginLeft: 50,
  },
  refreshmentValue: {
    width: 60,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 10,
    width: 100,
    color: COLORS.text.primary,
  },
  totalValue: {
    fontWeight: "bold",
    fontSize: 11,
  },
  
  // Remark Section - FIXED: removed borderRadius or set it to 0
  remarkSection: {
    marginBottom: 15,
    padding: 8,
    backgroundColor: COLORS.bg.secondary,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  remarkText: {
    fontStyle: "italic",
    color: COLORS.primary,
  },
  
  // Terms & Conditions - FIXED: removed borderRadius or set it to 0
  termsTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: COLORS.warning,
  },
  termsSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: COLORS.bg.secondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  // Activities Section - FIXED: removed borderRadius or set it to 0
  activitiesSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: COLORS.bg.light,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  activitiesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  activitiesTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  activitiesLogo: {},
  activitiesCompanyLogo: {
    width: 120,
    height: 30,
  },
  activitiesBanner: {
    width: "100%",
    height: 80,
    marginBottom: 10,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: COLORS.bg.primary,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  activityContent: {
    flex: 1,
  },
  activityTitleText: {
    fontWeight: "bold",
    fontSize: 10,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 8,
    color: COLORS.text.secondary,
  },
  activityPriceSection: {
    alignItems: "flex-end",
  },
  activityPriceLabel: {
    fontSize: 8,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  activityPriceValue: {
    fontWeight: "bold",
    fontSize: 10,
    color: COLORS.secondary,
  },
  
  // Footer
  footer: {
    marginTop: 25,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerContent: {
    alignItems: "center",
    marginBottom: 8,
  },
  contactText: {
    fontWeight: "bold",
    fontSize: 9,
    marginBottom: 3,
  },
  emailText: {
    fontSize: 9,
    marginBottom: 3,
    color: COLORS.primary,
  },
  addressText: {
    fontSize: 8,
    color: COLORS.text.secondary,
    fontStyle: "italic",
  },
  footerBottom: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: "center",
  },
  footerNote: {
    fontSize: 8,
    color: COLORS.text.secondary,
    fontStyle: "italic",
  },
  
  // Old styles (kept for backward compatibility if needed)
  header: {
    backgroundColor: COLORS.primary,
    padding: "10 16",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text.inverse,
    letterSpacing: -0.3,
  },
  companySubtitle: {
    fontSize: 6,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  content: {
    padding: 16,
  },
  infoBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  infoBox: {
    flex: 1,
    backgroundColor: COLORS.bg.secondary,
    border: `0.5px solid ${COLORS.border}`,
    padding: 6,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 6,
    color: COLORS.text.secondary,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  typeBadge: {
    backgroundColor: COLORS.secondary,
    color: COLORS.text.inverse,
    padding: "3 10",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  confirmationHero: {
    backgroundColor: COLORS.primaryLight,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  confirmationLabel: {
    fontSize: 7,
    color: COLORS.text.secondary,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  confirmationNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 2,
  },
  statusBadge: {
    backgroundColor: COLORS.success,
    color: COLORS.text.inverse,
    padding: "2 8",
    fontSize: 6,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 4,
  },
  routeCard: {
    border: `0.5px solid ${COLORS.border}`,
    padding: 10,
    marginBottom: 10,
  },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottom: `0.5px solid ${COLORS.border}`,
  },
  ferryName: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  operatorBadge: {
    backgroundColor: COLORS.secondary,
    color: COLORS.text.inverse,
    padding: "2 8",
    fontSize: 6,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  routeVisual: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    backgroundColor: COLORS.bg.secondary,
    padding: 8,
    gap: 10,
  },
  location: {
    alignItems: "center",
  },
  locationName: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  locationCode: {
    fontSize: 6,
    color: COLORS.text.secondary,
    marginTop: 1,
  },
  arrow: {
    fontSize: 14,
    color: COLORS.primary,
    marginHorizontal: 8,
  },
  scheduleRow: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 6,
    borderTop: `0.5px solid ${COLORS.border}`,
  },
  scheduleItem: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 6,
    color: COLORS.text.secondary,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  scheduleValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  pnrBox: {
    backgroundColor: COLORS.primaryLight,
    padding: "5 8",
    marginTop: 6,
    alignItems: "center",
  },
  pnrText: {
    fontSize: 6,
    color: COLORS.text.secondary,
    marginBottom: 1,
  },
  pnrValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  activityCard: {
    border: `0.5px solid ${COLORS.primaryLight}`,
    padding: 10,
    marginBottom: 10,
  },
  activityName: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  activityDetail: {
    fontSize: 7,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  ferryTable: {
    border: `0.5px solid ${COLORS.border}`,
  },
  passengerList: {
    border: `0.5px solid ${COLORS.bg.secondary}`,
  },
  passengerItem: {
    flexDirection: "row",
    padding: 6,
  },
  passengerItemAlt: {
    backgroundColor: COLORS.bg.secondary,
  },
  passengerNumber: {
    width: "10%",
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  passengerName: {
    width: "50%",
    fontSize: 7,
    color: COLORS.text.primary,
  },
  passengerInfo: {
    width: "40%",
    fontSize: 6,
    color: COLORS.text.secondary,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    marginTop: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.bg.secondary,
    padding: 8,
  },
  cardTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  cardText: {
    fontSize: 7,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  cardTextBold: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  pricingBox: {
    backgroundColor: COLORS.bg.light,
    padding: 8,
    marginBottom: 10,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    fontSize: 7,
  },
  pricingTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 6,
    borderTop: `1px solid ${COLORS.primaryLight}`,
  },
  importantBox: {
    backgroundColor: "#FFF3E0",
    padding: 6,
    marginBottom: 8,
  },
  importantTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.warning,
    marginBottom: 3,
  },
  importantText: {
    fontSize: 6,
    color: COLORS.text.primary,
    lineHeight: 1.3,
    marginBottom: 1,
  },
  termsBox: {
    backgroundColor: COLORS.bg.secondary,
    padding: 6,
  },
  termItem: {
    fontSize: 8,
    color: COLORS.text.secondary,
    lineHeight: 1.2,
    marginBottom: 4,
    paddingLeft: 6,
  },
  footerText: {
    fontSize: 5.5,
    color: COLORS.text.secondary,
  },
});