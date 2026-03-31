import NotificationService from "@/services/notifications/notificationService";
import { CollectionConfig } from "payload";

const Enquiries: CollectionConfig = {
  slug: "enquiries",
  admin: {
    useAsTitle: "enquiryId",
    defaultColumns: ["enquiryId", "fullName", "email", "status", "createdAt"],
    group: "Customer Management",
  },
  access: {
    read: ({ req: { user } }) => {
      // Only authenticated users can read enquiries
      return Boolean(user);
    },
    create: () => true, // Allow API to create enquiries
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // Enquiry Identification
    {
      name: "enquiryId",
      type: "text",
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: "Auto-generated unique enquiry ID",
      },
      hooks: {
        beforeValidate: [
          ({ value, operation }) => {
            if (operation === "create" && !value) {
              // Generate enquiry ID: ENQ-YYYYMMDD-XXXX
              const now = new Date();
              const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
              const randomStr = Math.random()
                .toString(36)
                .substring(2, 6)
                .toUpperCase();
              return `ENQ-${dateStr}-${randomStr}`;
            }
            return value;
          },
        ],
      },
    },

    // Customer Information
    {
      name: "customerInfo",
      type: "group",
      fields: [
        {
          name: "fullName",
          type: "text",
          required: true,
        },
        {
          name: "email",
          type: "email",
          required: true,
        },
        {
          name: "phone",
          type: "text",
          required: true,
        },
        {
          name: "age",
          type: "number",
          min: 1,
          max: 120,
        },
      ],
    },

    // Booking Details
    {
      name: "bookingDetails",
      type: "group",
      fields: [
        {
          name: "selectedPackage",
          type: "text",
          admin: {
            description: "Package selected from the form",
          },
        },
        {
          name: "duration",
          type: "text",
          admin: {
            description: "Selected duration/period",
          },
        },
        {
          name: "checkIn",
          type: "date",
        },
        {
          name: "checkOut",
          type: "date",
        },
        {
          name: "adults",
          type: "number",
          min: 1,
          defaultValue: 2,
        },
        {
          name: "children",
          type: "number",
          min: 0,
          defaultValue: 0,
        },
        {
          name: "tags",
          type: "array",
          fields: [
            {
              name: "tag",
              type: "text",
            },
          ],
        },
      ],
    },

    // Package Information (if from package page)
    {
      name: "packageInfo",
      type: "group",
      admin: {
        condition: (data) => data.enquirySource === "package-detail",
      },
      fields: [
        {
          name: "title",
          type: "text",
        },
        {
          name: "price",
          type: "number",
        },
        {
          name: "period",
          type: "text",
        },
        {
          name: "description",
          type: "textarea",
        },
      ],
    },

    // Messages
    {
      name: "messages",
      type: "group",
      fields: [
        {
          name: "message",
          type: "textarea",
          admin: {
            description: "Main enquiry message",
          },
        },
        {
          name: "additionalMessage",
          type: "textarea",
          admin: {
            description: "Additional message from customer",
          },
        },
      ],
    },

    // Enquiry Metadata
    {
      name: "enquiryMetadata",
      type: "group",
      admin: {
        position: "sidebar",
      },
      fields: [
        {
          name: "enquirySource",
          type: "select",
          options: [
            { label: "Direct Contact", value: "direct" },
            { label: "Package Detail Page", value: "package-detail" },
            { label: "Other", value: "other" },
          ],
          defaultValue: "direct",
        },
        {
          name: "status",
          type: "select",
          options: [
            { label: "New", value: "new" },
            { label: "In Progress", value: "in-progress" },
            { label: "Quoted", value: "quoted" },
            { label: "Converted", value: "converted" },
            { label: "Closed", value: "closed" },
          ],
          defaultValue: "new",
        },
        {
          name: "priority",
          type: "select",
          options: [
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "High", value: "high" },
            { label: "Urgent", value: "urgent" },
          ],
          defaultValue: "medium",
        },
        {
          name: "assignedTo",
          type: "relationship",
          relationTo: "users",
          admin: {
            description: "Team member assigned to handle this enquiry",
          },
        },
      ],
    },

    // Communication Log
    {
      name: "communicationLog",
      type: "array",
      admin: {
        description: "Track all communications with the customer",
      },
      fields: [
        {
          name: "type",
          type: "select",
          options: [
            { label: "Email Sent", value: "email-sent" },
            { label: "Email Received", value: "email-received" },
            { label: "Phone Call", value: "phone-call" },
            { label: "WhatsApp", value: "whatsapp" },
            { label: "Internal Note", value: "internal-note" },
          ],
          required: true,
        },
        {
          name: "message",
          type: "textarea",
          required: true,
        },
        {
          name: "performedBy",
          type: "relationship",
          relationTo: "users",
        },
        {
          name: "timestamp",
          type: "date",
          defaultValue: () => new Date(),
          admin: {
            readOnly: true,
          },
        },
      ],
    },

    // Technical Details
    {
      name: "technicalDetails",
      type: "group",
      admin: {
        position: "sidebar",
        description: "Technical details for debugging",
      },
      fields: [
        {
          name: "userAgent",
          type: "text",
          admin: {
            readOnly: true,
          },
        },
        {
          name: "ipAddress",
          type: "text",
          admin: {
            readOnly: true,
          },
        },
        {
          name: "recaptchaScore",
          type: "text",
          admin: {
            readOnly: true,
          },
        },
        {
          name: "submissionTimestamp",
          type: "date",
          admin: {
            readOnly: true,
          },
        },
      ],
    },
  ],

  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Send welcome email after enquiry creation
        if (operation === "create") {
          try {
            const enquiryData = {
              enquiryId: doc.enquiryId,
              fullName: doc.customerInfo.fullName,
              email: doc.customerInfo.email,
              phone: doc.customerInfo.phone,
              selectedPackage: doc.bookingDetails?.selectedPackage,
              message: doc.messages?.message,
              additionalMessage: doc.messages?.additionalMessage,
              packageInfo: doc.packageInfo,
              enquirySource: doc.enquiryMetadata?.enquirySource,
              submissionDate: doc.createdAt,
            };

            // Send confirmation to customer and notification to admin
            const customerResult =
              await NotificationService.sendEnquiryConfirmation(enquiryData);
            const adminResult =
              await NotificationService.sendEnquiryNotification(enquiryData);

            // Log Results
            if (customerResult.success) {
              console.log(
                `✅ Enquiry confirmation email sent to ${doc.customerInfo.email}`
              );
            } else {
              console.error(
                `❌ Failed to send enquiry confirmation email to ${doc.customerInfo.email}:`,
                customerResult.error
              );
            }

            if (adminResult.success) {
              console.log(`✅ Enquiry notification email sent to admin`);
            } else {
              console.error(
                `❌ Failed to send enquiry notification email to admin:`,
                adminResult.error
              );
            }

            // Log the results
            console.log("Enquiry Confirmation Result:", customerResult);
            console.log("Enquiry Notification Result:", adminResult);
          } catch (error) {
            console.error(
              `❌ Failed to send emails for enquiry ${doc.enquiryId}:`,
              error
            );
          }
        }
      },
    ],
  },
};

export default Enquiries;
