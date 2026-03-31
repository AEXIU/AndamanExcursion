import { Block } from "payload";

export const partnersBlock: Block = {
  slug: "partners",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "specialWord",
      type: "text",
      required: true,
      admin: {
        description: "Word to highlight in the title",
      },
    },
    {
      name: "partners",
      type: "array",
      fields: [
        {
          name: "partner",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "alt",
          type: "text",
        },
      ],
    },
  ],
};

// export interface PartnersProps {
//   content: PartnersContent;
// }

// export interface PartnersContent {
//   title: string;
//   specialWord: string;
//   partners: string[];
//   partnersAlt: string[];
// }

// import partner1 from "@public/icons/partners/dss.svg";
// import partner2 from "@public/icons/partners/greenOcean.svg";
// import partner3 from "@public/icons/partners/nautika.svg";
// import partner4 from "@public/icons/partners/makruzz.svg";

// partners: {
//   title: "Our Trusted Partners",
//   specialWord: "Partners",
//   partners: [partner1, partner2, partner3, partner4],
//   partnersAlt: ["dss", "greenOcean", "nautika", "makruzz"],
// },
