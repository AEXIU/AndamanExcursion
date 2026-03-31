import { Block } from "payload";

export const thingsToDoBlock: Block = {
    slug: "thingsToDo",
    labels: {
        singular: "Things to Do",
        plural: "Things to Do",
    },
    fields: [
        {
            name: "title",
            type: "text",
            required: true,
            defaultValue: "Things to do",
            admin: {
                description: "Main title text (e.g. 'Things to do')",
            },
        },
        {
            name: "specialWord",
            type: "text",
            required: true,
            admin: {
                description:
                    "Highlighted location name (e.g. 'Ross and North Island')",
            },
        },
        {
            name: "images",
            type: "array",
            label: "Activity Images",
            minRows: 3,
            maxRows: 3,
            required: true,
            fields: [
                {
                    name: "image",
                    type: "upload",
                    relationTo: "media",
                    required: true,
                },
                {
                    name: "alt",
                    type: "text",
                    label: "Alt Text",
                    required: true,
                    admin: {
                        description:
                            "Descriptive alt text for accessibility (e.g. 'Kayaking in crystal clear water')",
                    },
                },
            ],
        },
    ],
};
