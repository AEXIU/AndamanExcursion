import { Block } from "payload";

export const topActivityCategories: Block = {
  slug: "topActivityCategories",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      defaultValue: "Water",
    },
    {
      name: "specialWord",
      type: "text",
      required: true,
      defaultValue: "Adventures",
    },
    {
      name: "description",
      type: "text",
      defaultValue:
        "From snorkeling in coral gardens to jet skiing across blue horizons, your adventure begins here.",
    },
    {
      name: "activityCategories",
      type: "relationship",
      relationTo: "activity-categories",
      hasMany: true,
      required: true,
      admin: {
        description:
          "Select the activities to display in the top activities section",
      },
      filterOptions: ({ data }) => {
        return {
          isActive: { equals: true },
        };
      },
    },
    {
      name: "maxActivities",
      type: "number",
      defaultValue: 9,
      admin: {
        description: "Maximum number of activities to display",
      },
    },
    {
      name: "showCustomerFavorite",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Show 'Customer's Favourite' badge on featured activities",
      },
    },
  ],
};
