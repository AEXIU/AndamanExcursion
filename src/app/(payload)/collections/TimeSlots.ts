import { CollectionConfig } from "payload";

const TimeSlots: CollectionConfig = {
  slug: "time-slots",
  admin: {
    useAsTitle: "startTime",
    defaultColumns: ["twelveHourTime", "startTime", "endTime", "isActive"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "startTime",
      type: "text",
      required: true,
      admin: {
        description: "Start time in 24-hour format (e.g., '09:00', '14:30')",
        placeholder: "09:00",
      },
      validate: (value: any) => {
        if (!value) return "Start time is required";

        // Validate 24-hour format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) {
          return "Please use 24-hour format (HH:MM)";
        }

        return true;
      },
    },
    {
      name: "endTime",
      type: "text",
      admin: {
        description:
          "End time in 24-hour format (optional, for display purposes)",
        placeholder: "11:00",
      },
      validate: (value: any, { data }: { data: any }) => {
        if (!value) return true; // Optional field

        // Validate 24-hour format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) {
          return "Please use 24-hour format (HH:MM)";
        }

        // Check if end time is after start time
        if (data.startTime) {
          const startMinutes = timeToMinutes(data.startTime);
          const endMinutes = timeToMinutes(value);

          if (endMinutes <= startMinutes) {
            return "End time must be after start time";
          }
        }

        return true;
      },
    },
    {
      name: "type",
      type: "select",
      defaultValue: "activity",
      required: true,
      options: [
        { label: "Activity", value: "activity" },
        { label: "Ferry", value: "ferry" },
        { label: "Boat", value: "boat" },
        { label: "Package", value: "package" },
        { label: "General", value: "general" },
      ],
      admin: {
        description: "Type of time slot",
      },
    },
    {
      name: "duration",
      type: "number",
      defaultValue: 30,
      admin: {
        description: "Duration in minutes (optional, for reference)",
        placeholder: "120",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL-friendly identifier for this time slot",
        readOnly: true,
      },
    },
    {
      name: "twelveHourTime",
      type: "text",
      admin: {
        description: "12-hour format time (e.g., '7:00 AM', '8:00 AM')",
        readOnly: true,
      },
    },
    {
      name: "status",
      type: "group",
      admin: {
        description: "Status and priority settings",
        position: "sidebar",
      },
      fields: [
        {
          name: "isActive",
          type: "checkbox",
          defaultValue: true,
          admin: {
            description: "Is this time slot currently available for booking?",
          },
        },
        {
          name: "priority",
          type: "number",
          defaultValue: 0,
          admin: {
            description: "Display priority (higher numbers appear first)",
          },
        },
        {
          name: "isPopular",
          type: "checkbox",
          admin: {
            description: "Mark as popular/recommended slot",
          },
        },
      ],
    },
  ],
  defaultSort: "startTime",
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Generate 12-hour time for display
        if (data.startTime) {
          data.twelveHourTime = formatTimeForDisplay(data.startTime);
        }

        // Auto-generate slug from startTime
        if (data.startTime && !data.slug) {
          data.slug = data.startTime
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        }

        return data;
      },
    ],
    beforeValidate: [
      ({ data }) => {
        // Validate that end time is after start time
        if (data?.startTime && data?.endTime) {
          const startMinutes = timeToMinutes(data.startTime);
          const endMinutes = timeToMinutes(data?.endTime);

          if (endMinutes <= startMinutes) {
            throw new Error("End time must be after start time");
          }
        }

        return data;
      },
    ],
  },
};

export default TimeSlots;

// Helper function to convert time string to minutes
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map((num) => parseInt(num, 10));
  return hours * 60 + minutes;
}

// Helper function to format 24-hour time for display in 12-hour format
function formatTimeForDisplay(time24: string): string {
  if (!time24 || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time24)) {
    return "Invalid time"; // Handle invalid or missing input
  }

  const [hours, minutes] = time24.split(":").map((num) => parseInt(num, 10));
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  const paddedMinutes = minutes.toString().padStart(2, "0");

  return `${displayHour}:${paddedMinutes} ${ampm}`;
}
