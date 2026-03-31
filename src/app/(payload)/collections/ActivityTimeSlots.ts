import type { CollectionConfig } from "payload";

const ActivityTimeSlots: CollectionConfig = {
  slug: "activity-time-slots",
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: "title",
    description: "Manage time slots available for different activity types",
    group: "Activities",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description:
          "Descriptive name for this time slot (e.g., 'Morning Session', 'Afternoon Adventure')",
      },
    },
    {
      name: "startTime",
      type: "text",
      required: true,
      index: true,
      admin: {
        description: "Start time in 24-hour format (e.g., '09:00')",
        placeholder: "09:00",
      },
      validate: (value: string | null | undefined) => {
        if (!value) return "Start time is required";

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) {
          return "Please enter time in HH:MM format (e.g., 09:00)";
        }

        return true;
      },
    },
    {
      name: "endTime",
      type: "text",
      required: true,
      index: true,
      admin: {
        description: "End time in 24-hour format (e.g., '11:00')",
        placeholder: "11:00",
      },
      validate: (value: string | null | undefined, { data }: { data: any }) => {
        if (!value) return "End time is required";

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) {
          return "Please enter time in HH:MM format (e.g., 11:00)";
        }

        // Validate end time is after start time
        if (data?.startTime) {
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
      name: "displayTime",
      type: "text",
      admin: {
        description:
          "How this time slot appears to users (auto-generated if empty)",
        placeholder: "9:00 AM - 11:00 AM",
        readOnly: true,
      },
    },
    {
      name: "duration",
      type: "number",
      admin: {
        description: "Duration in minutes (auto-calculated)",
        readOnly: true,
      },
    },
    // Removed backwards relationship - activities now reference time slots directly
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      index: true,
      admin: {
        description: "Is this time slot currently available for booking?",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      index: true,
      admin: {
        description: "Display order (higher numbers appear first)",
      },
    },
    {
      name: "notes",
      type: "textarea",
      admin: {
        description: "Internal notes about this time slot (not shown to users)",
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate display time if not provided
        if (data.startTime && data.endTime && !data.displayTime) {
          data.displayTime = `${formatTimeForDisplay(
            data.startTime
          )} - ${formatTimeForDisplay(data.endTime)}`;
        }

        // Auto-calculate duration
        if (data.startTime && data.endTime) {
          const startMinutes = timeToMinutes(data.startTime);
          const endMinutes = timeToMinutes(data.endTime);
          data.duration = endMinutes - startMinutes;
        }

        return data;
      },
    ],
  },
  defaultSort: "sortOrder",
};

// Helper functions
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTimeForDisplay(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export default ActivityTimeSlots;
