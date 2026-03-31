import { Block } from "payload";

export const tripRouteBlock: Block = {
    slug: "tripRoute",
    labels: {
        singular: "Trip Route Map",
        plural: "Trip Route Maps",
    },
    fields: [
        {
            name: "title",
            type: "text",
            required: true,
            defaultValue: "See the Trip Route",
            admin: {
                description: "Section title (e.g. 'See the Trip Route')",
            },
        },
        {
            name: "specialWord",
            type: "text",
            admin: {
                description: "Highlighted word in the title (optional)",
            },
        },
        {
            name: "description",
            type: "textarea",
            admin: {
                description: "Optional description below the title",
            },
        },
        {
            name: "routePoints",
            type: "array",
            label: "Route Waypoints",
            admin: {
                description:
                    "Define the stops along the boat route (shown as labels on the map)",
            },
            fields: [
                {
                    name: "name",
                    type: "text",
                    required: true,
                    admin: {
                        description: "Name of the stop (e.g. 'Port Blair', 'Havelock')",
                    },
                },
                {
                    name: "order",
                    type: "number",
                    required: true,
                    defaultValue: 0,
                    admin: {
                        description: "Order of this stop in the route (lower = first)",
                    },
                },
            ],
        },
    ],
};
