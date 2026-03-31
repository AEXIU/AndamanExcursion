/**
 * WhatsApp Integration Test Script
 * Tests all 5 approved templates with realistic data
 * 
 * Usage:
 *   npm install -g ts-node
 *   ts-node scripts/test-whatsapp-integration.ts
 * 
 * Or using npx:
 *   npx ts-node scripts/test-whatsapp-integration.ts
 */

import { notificationManager } from "../src/services/notifications/NotificationManager.js";
import type {
    BookingConfirmationData,
    BookingStatusUpdateData,
    PaymentFailedData,
    EnquiryData,
} from "../src/services/notifications/channels/base";

const TEST_PHONE = process.env.TEST_PHONE || "+918600713587";

async function testWhatsAppIntegration() {
    console.log("=".repeat(60));
    console.log("WhatsApp Template Integration Test");
    console.log("=".repeat(60));
    console.log(`Test phone number: ${TEST_PHONE}\n`);

    const results: Record<string, { success: boolean; error?: string }> = {};

    // Test 1: Booking Confirmation Template (10 parameters)
    console.log("\n[1/5] Testing Booking Confirmation Template...");
    try {
        const bookingData: BookingConfirmationData = {
            bookingId: "TEST12345",
            confirmationNumber: "AE2025001234",
            customerName: "Test Customer",
            customerEmail: "test@example.com",
            bookingDate: new Date().toISOString(),
            serviceDate: "2025-03-15",
            totalAmount: 2800,
            currency: "INR",
            bookingType: "ferry",
            items: [
                {
                    title: "Makruzz Ferry",
                    date: "2025-03-15",
                    time: "08:30 AM",
                    location: "Port Blair → Havelock Island",
                    passengers: 2,
                },
            ],
        };

        const result = await notificationManager.sendBookingConfirmation(
            bookingData,
            { email: "test@example.com", phone: TEST_PHONE },
            {
                sendEmailUpdates: false,
                sendWhatsAppUpdates: true,
                language: "en",
            }
        );

        results["Booking Confirmation"] = result.whatsapp!;
        console.log(`✓ Status: ${result.whatsapp?.success ? "SUCCESS" : "FAILED"}`);
        if (result.whatsapp?.error) {
            console.log(`  Error: ${result.whatsapp.error}`);
        }
    } catch (error: any) {
        results["Booking Confirmation"] = {
            success: false,
            error: error.message,
        };
        console.log(`✗ Error: ${error.message}`);
    }

    // Test 2: Booking Status Update Template (9 parameters)
    console.log("\n[2/5] Testing Booking Status Update Template...");
    try {
        const statusUpdateData: BookingStatusUpdateData = {
            bookingId: "TEST12345",
            confirmationNumber: "AE2025001234",
            customerName: "Test Customer",
            customerEmail: "test@example.com",
            oldStatus: "Pending",
            newStatus: "Confirmed",
            message: "Your booking has been confirmed successfully!",
            updateDate: new Date().toISOString(),
        };

        const result = await notificationManager.sendBookingStatusUpdate(
            statusUpdateData,
            { email: "test@example.com", phone: TEST_PHONE },
            {
                sendEmailUpdates: false,
                sendWhatsAppUpdates: true,
                language: "en",
            },
            statusUpdateData.message
        );

        results["Booking Status Update"] = result.whatsapp!;
        console.log(`✓ Status: ${result.whatsapp?.success ? "SUCCESS" : "FAILED"}`);
        if (result.whatsapp?.error) {
            console.log(`  Error: ${result.whatsapp.error}`);
        }
    } catch (error: any) {
        results["Booking Status Update"] = {
            success: false,
            error: error.message,
        };
        console.log(`✗ Error: ${error.message}`);
    }

    // Test 3: Booking Reminder Template (5 parameters)
    console.log("\n[3/5] Testing Booking Reminder Template...");
    try {
        const reminderData: BookingStatusUpdateData = {
            bookingId: "TEST12345",
            confirmationNumber: "AE2025001234",
            customerName: "Test Customer",
            customerEmail: "test@example.com",
            oldStatus: "Confirmed",
            newStatus: "Confirmed",
            message: "Reminder for your upcoming booking tomorrow",
            updateDate: new Date().toISOString(),
        };

        const result = await notificationManager.sendBookingReminder(
            reminderData,
            { email: "test@example.com", phone: TEST_PHONE },
            {
                sendEmailUpdates: false,
                sendWhatsAppUpdates: true,
                language: "en",
            }
        );

        results["Booking Reminder"] = result.whatsapp!;
        console.log(`✓ Status: ${result.whatsapp?.success ? "SUCCESS" : "FAILED"}`);
        if (result.whatsapp?.error) {
            console.log(`  Error: ${result.whatsapp.error}`);
        }
    } catch (error: any) {
        results["Booking Reminder"] = { success: false, error: error.message };
        console.log(`✗ Error: ${error.message}`);
    }

    // Test 4: Payment Failed Template (4 parameters)
    console.log("\n[4/5] Testing Payment Failed Template...");
    try {
        const paymentFailedData: PaymentFailedData = {
            customerEmail: "test@example.com",
            customerName: "Test Customer",
            attemptedAmount: 4500,
            failureReason: "Insufficient funds",
            bookingType: "ferry",
            currency: "INR",
        };

        const result = await notificationManager.sendPaymentFailedNotification(
            paymentFailedData,
            {
                sendEmailUpdates: false,
                sendWhatsAppUpdates: true,
                language: "en",
            }
        );

        results["Payment Failed"] = result.whatsapp!;
        console.log(`✓ Status: ${result.whatsapp?.success ? "SUCCESS" : "FAILED"}`);
        if (result.whatsapp?.error) {
            console.log(`  Error: ${result.whatsapp.error}`);
        }
    } catch (error: any) {
        results["Payment Failed"] = { success: false, error: error.message };
        console.log(`✗ Error: ${error.message}`);
    }

    // Test 5: Enquiry Confirmation Template (6 parameters)
    console.log("\n[5/5] Testing Enquiry Confirmation Template...");
    try {
        const enquiryData: EnquiryData = {
            enquiryId: "ENQ2025001",
            fullName: "Test Customer",
            email: "test@example.com",
            phone: TEST_PHONE,
            selectedPackage: "Havelock Island Package",
            message: "Looking for 3-day package",
            submissionDate: new Date().toISOString(),
            enquirySource: "package-detail",
        };

        const result = await notificationManager.sendEnquiryConfirmation(
            enquiryData,
            {
                sendEmailUpdates: false,
                sendWhatsAppUpdates: true,
                language: "en",
            }
        );

        results["Enquiry Confirmation"] = result.whatsapp!;
        console.log(`✓ Status: ${result.whatsapp?.success ? "SUCCESS" : "FAILED"}`);
        if (result.whatsapp?.error) {
            console.log(`  Error: ${result.whatsapp.error}`);
        }
    } catch (error: any) {
        results["Enquiry Confirmation"] = {
            success: false,
            error: error.message,
        };
        console.log(`✗ Error: ${error.message}`);
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("Test Summary");
    console.log("=".repeat(60));

    const successCount = Object.values(results).filter((r) => r.success).length;
    const failCount = Object.values(results).filter((r) => !r.success).length;

    Object.entries(results).forEach(([template, result]) => {
        const status = result.success ? "✅ SUCCESS" : "❌ FAILED";
        console.log(`${status} - ${template}`);
        if (result.error) {
            console.log(`         ${result.error}`);
        }
    });

    console.log(`\nTotal: ${successCount} passed, ${failCount} failed`);
    console.log("=".repeat(60));

    // Exit with appropriate code
    process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
testWhatsAppIntegration().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
