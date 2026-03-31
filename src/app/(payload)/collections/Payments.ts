// src/app/(payload)/collections/Payments.ts

import { CollectionConfig } from "payload";

export const Payments: CollectionConfig = {
  slug: "payments",
  admin: {
    useAsTitle: "transactionId",
    defaultColumns: ["transactionId", "amount", "status", "createdAt"],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
  fields: [
    {
      name: "transactionId",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Unique transaction identifier",
      },
    },
    {
      name: "amount",
      type: "number",
      required: true,
      admin: {
        description: "Amount in paise (₹1 = 100 paise)",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Success", value: "success" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" },
      ],
    },
    {
      name: "gateway",
      type: "select",
      required: true,
      defaultValue: "phonepe",
      options: [
        { label: "PhonePe", value: "phonepe" },
        { label: "Razorpay", value: "razorpay" }, // Keep for historical records
      ],
      admin: {
        description: "Payment gateway used",
      },
    },
    // PhonePe-specific data
    {
      name: "phonepeData",
      type: "group",
      fields: [
        {
          name: "merchantOrderId",
          type: "text",
          admin: {
            description: "PhonePe merchant order ID",
          },
        },
        {
          name: "phonepeTransactionId",
          type: "text",
          admin: {
            description: "PhonePe transaction ID",
          },
        },
        {
          name: "redirectUrl",
          type: "text",
        },
        {
          name: "checkoutUrl",
          type: "text",
        },
        {
          name: "statusCheckData",
          type: "json",
          admin: {
            description: "Response from status check API",
          },
        },
        {
          name: "callbackData",
          type: "json",
          admin: {
            description: "Data received from PhonePe callback",
          },
        },
        {
          name: "callbackReceivedAt",
          type: "date",
          admin: {
            description: "Timestamp when callback was received",
          },
        },
        {
          name: "createdAt",
          type: "date",
        },
      ],
    },
    // Legacy Razorpay data (keep for historical records)
    {
      name: "razorpayData",
      type: "group",
      fields: [
        {
          name: "razorpayOrderId",
          type: "text",
        },
        {
          name: "razorpayPaymentId",
          type: "text",
        },
        {
          name: "razorpaySignature",
          type: "text",
        },
      ],
    },
    {
      name: "customerDetails",
      type: "group",
      fields: [
        {
          name: "name",
          type: "text",
        },
        {
          name: "email",
          type: "email",
        },
        {
          name: "phone",
          type: "text",
        },
      ],
    },
    {
      name: "bookingData",
      type: "json",
      admin: {
        description: "Complete booking data for reference",
      },
    },
    {
      name: "gatewayResponse",
      type: "json",
      admin: {
        description: "Raw gateway response",
      },
    },
    {
      name: "errorDetails",
      type: "group",
      fields: [
        {
          name: "message",
          type: "textarea",
        },
        {
          name: "timestamp",
          type: "date",
        },
      ],
    },
    {
      name: "refundDetails",
      type: "group",
      fields: [
        {
          name: "refundId",
          type: "text",
        },
        {
          name: "refundAmount",
          type: "number",
        },
        {
          name: "refundStatus",
          type: "select",
          options: [
            { label: "Initiated", value: "initiated" },
            { label: "Processing", value: "processing" },
            { label: "Completed", value: "completed" },
            { label: "Failed", value: "failed" },
          ],
        },
        {
          name: "refundReason",
          type: "textarea",
        },
        {
          name: "refundedAt",
          type: "date",
        },
      ],
    },
  ],
  timestamps: true,
};

export default Payments;
