import { Seat } from "@/types/FerryBookingSession.types";
import seatAvailable from "@public/graphics/ship_parts/seat_available.svg";
import seatBooked from "@public/graphics/ship_parts/seat_booked.svg";
import seatSelected from "@public/graphics/ship_parts/seat_selected.svg";
import styles from "@components/ferry/layouts/SeatLayout.module.css";

// Function to get the appropriate seat image based on seat state
export const getSeatImage = (seat: Seat) => {
  // Priority order: selected > booked > blocked > premium > accessible > available
  if (seat.status === "selected") return seatSelected;
  if (seat.status === "booked" || seat.status === "blocked") return seatBooked;

  return seatAvailable;
};

// Updated className function - removed visual styles since we're using images
export const getSeatClassName = (seat: Seat) => {
  const classes = [styles.seatWrapper];

  // Add interaction states
  if (seat.status === "booked" || seat.status === "blocked") {
    classes.push(styles.seatDisabled);
  } else {
    classes.push(styles.seatInteractive);
  }

  // Add tier classes if needed for positioning/spacing
  if (seat.tier) classes.push(styles[`tier${seat.tier}`]);

  return classes.filter(Boolean).join(" ");
};

export const SEALINK_LUXURY_SEATS = {
  group1: [
    "2A",
    "2B",
    "2C",
    "3A",
    "3B",
    "3C",
    "4A",
    "4B",
    "4C",
    "5A",
    "5B",
    "5C",
    "6A",
    "6B",
    "6C",
  ],
  group2: ["1E", "1F", "1G", "1H", "1I"],
  group3: [
    "2D",
    "2E",
    "2F",
    "2G",
    "2H",
    "2I",
    "3D",
    "3E",
    "3F",
    "3G",
    "3H",
    "3I",
    "4D",
    "4E",
    "4F",
    "4G",
    "4H",
    "4I",
    "5D",
    "5E",
    "5F",
    "5G",
    "5H",
    "5I",
    "6D",
    "6E",
    "6F",
    "6G",
    "6H",
    "6I",
    "7D",
    "7E",
    "7F",
    "7G",
    "7H",
    "7I",
  ],
  group4: [
    "2J",
    "2K",
    "2L",
    "3J",
    "3K",
    "3L",
    "4J",
    "4K",
    "4L",
    "5J",
    "5K",
    "5L",
    "6J",
    "6K",
    "6L",
  ],
  group5: [
    "7A",
    "7B",
    "7C",
    "8A",
    "8B",
    "8C",
    "9A",
    "9B",
    "9C",
    "10A",
    "10B",
    "10C",
    "11A",
    "11B",
    "11C",
    "12A",
    "12B",
    "12C",
    "13A",
    "13B",
    "13C",
    "14A",
    "14B",
    "14C",
    "15A",
    "15B",
    "15C",
    "16A",
    "16B",
    "16C",
    "17A",
    "17B",
    "17C",
  ],
  group6: [
    "8D",
    "8E",
    "8F",
    "8G",
    "8H",
    "8I",
    "9D",
    "9E",
    "9F",
    "9G",
    "9H",
    "9I",
    "10D",
    "10E",
    "10F",
    "10G",
    "10H",
    "10I",
    "11D",
    "11E",
    "11F",
    "11G",
    "11H",
    "11I",
    "12D",
    "12E",
    "12F",
    "12G",
    "12H",
    "12I",
    "13D",
    "13E",
    "13F",
    "13G",
    "13H",
    "13I",
    "14D",
    "14E",
    "14F",
    "14G",
    "14H",
    "14I",
    "15D",
    "15E",
    "15F",
    "15G",
    "15H",
    "15I",
    "16D",
    "16E",
    "16F",
    "16G",
    "16H",
    "16I",
  ],
  group7: ["17E", "17F", "17G", "17H", "17I"],
  group8: [
    "7J",
    "7K",
    "7L",
    "8J",
    "8K",
    "8L",
    "9J",
    "9K",
    "9L",
    "10J",
    "10K",
    "10L",
    "11J",
    "11K",
    "11L",
    "12J",
    "12K",
    "12L",
    "13J",
    "13K",
    "13L",
    "14J",
    "14K",
    "14L",
    "15J",
    "15K",
    "15L",
    "16J",
    "16K",
    "16L",
    "17J",
    "17K",
    "17L",
  ],
};

export const SEALINK_ROYAL_SEATS = {
  group1: [
    "1A",
    "1B",
    "2A",
    "2B",
    "3A",
    "3B",
    "4A",
    "4B",
    "5A",
    "5B",
    "6A",
    "6B",
    "7A",
    "7B",
    "8A",
    "8B",
    "9A",
    "9B",
    "10A",
    "10B",
    "11A",
    "11B",
    "12A",
    "12B",
  ],
  group2: [
    "5C",
    "5D",
    "5E",
    "5F",
    "5G",
    "5H",
    "6C",
    "6D",
    "6E",
    "6F",
    "6G",
    "6H",
    "7C",
    "7D",
    "7E",
    "7F",
    "7G",
    "7H",
    "8C",
    "8D",
    "8E",
    "8F",
    "8G",
    "8H",
    "9C",
    "9D",
    "9E",
    "9F",
    "9G",
    "9H",
    "10C",
    "10D",
    "10E",
    "10F",
    "10G",
    "10H",
    "11C",
    "11D",
    "11E",
    "11F",
    "11G",
    "11H",
  ],
  group3: ["1I", "1J", "1K", "2I", "2J", "2K"],
  group4: [
    "3J",
    "3K",
    "4J",
    "4K",
    "5J",
    "5K",
    "6J",
    "6K",
    "7J",
    "7K",
    "8J",
    "8K",
    "9J",
    "9K",
    "10J",
    "10K",
    "11J",
    "11K",
    "12J",
    "12K",
  ],
};

// introducing null value : if null, render an empty block
export const GREENOCEAN_ECONOMY_SEATS = {
  group1: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"], // E1 to E8, 2x4 grid
  group2: ["E9", "E10", "E11"], // E9 to E11, 1x3 grid
  group3: [
    "E12",
    "E13",
    null,
    null,
    "E14",
    "E15",
    "E16",
    "E17",
    "E18",
    null,
    "E19",
    "E20",
    "E21",
    "E22",
    "E23",
    "E24",
    "E25",
    "E26",
  ], // E12 to E26, 6x3 grid
  group4: [
    "E27",
    "E28",
    "E29",
    "E30",
    "E31",
    "E32",
    "E33",
    "E34",
    "E35",
    "E36",
    "E37",
    "E38",
    "E39",
    "E40",
    "E41",
    "E42",
    "E43",
    "E44",
    "E45",
    "E46",
    "E47",
    "E48",
    "E49",
    "E50",
  ], // E27 to E50, 5x5 grid
  group5: [
    "E51",
    "E52",
    "E53",
    "E54",
    "E55",
    "E56",
    "E57",
    "E58",
    "E59",
    "E60",
    "E61",
    "E62",
  ], // E51 to E62, 2x6 grid
  group6: [
    "E63",
    "E64",
    "E65",
    "E66",
    "E67",
    "E68",
    "E69",
    "E70",
    "E71",
    "E72",
    "E73",
    "E74",
    "E75",
    "E76",
    "E77",
  ], // E63 to E77, 5x3 grid
  group7: [
    "E78",
    "E79",
    "E82",
    "E83",
    "E86",
    "E87",
    "E90",
    "E91",
    "E94",
    "E95",
    "E98",
    "E99",
    "E102",
    "E103",
    "E106",
    "E107",
    "E110",
    "E111",
  ], // 2xauto-fill grid
  group8: [
    "E80",
    "E81",
    "E84",
    "E85",
    "E88",
    "E89",
    "E92",
    "E93",
    "E96",
    "E97",
    "E100",
    "E101",
    "E104",
    "E105",
    "E108",
    "E109",
    "E112",
    "E113",
  ], // 2xauto-fill grid
  group9: ["E116", "E117", "E118", "E119", "E120", "E121", "E122", "E123"], // E116 to E123, 4x2 grid
  group10: [
    "E124",
    "E125",
    "E128",
    "E129",
    "E132",
    "E133",
    "E136",
    "E137",
    "E140",
    "E141",
    "E144",
    "E145",
    "E148",
    "E149",
    "E152",
    "E153",
    "E156",
    "E157",
  ],
  group11: [
    "E126",
    "E127",
    "E130",
    "E131",
    "E134",
    "E135",
    "E138",
    "E139",
    "E142",
    "E143",
    "E146",
    "E147",
    "E150",
    "E151",
    "E154",
    "E155",
    "E158",
    "E159",
  ],
  group12: ["E160"],
};

export const GREENOCEAN_PREMIUM_SEATS = {
  group1: [
    "P1",
    "P2",
    "P3",
    "P4",
    "P5",
    "P6",
    "P7",
    "P8",
    "P9",
    "P10",
    "P11",
    "P12",
    "P13",
    "P14",
    "P15",
    "P16",
  ], // P1 to P16, 2x8 grid

  group2: [
    "P17",
    "P18",
    "P19",
    "P20",
    "P21",
    "P22",
    "P23",
    "P24",
    "P25",
    "P26",
    "P27",
    "P28",
    "P29",
    "P30",
    "P31",
    "P32",
    "P33",
    "P34",
    "P35",
    "P36",
    "P37",
    "P38",
    "P39",
    "P40",
    "P41",
    "P42",
    "P43",
    "P44",
  ], // P17 to P44, 4x7 grid

  group3: ["P45", "P46"], // 1x2 grid

  group4: ["P47", "P48"], // 1x2 grid

  group5: [
    "P49",
    "P50",
    "P51",
    "P52",
    "P53",
    "P54",
    "P55",
    "P56",
    "P57",
    "P58",
    "P59",
    "P60",
    "P61",
    "P62",
    "P63",
    "P64",
    "P65",
    "P66",
    "P67",
    "P68",
  ], // P49 to P68, 2x10 grid

  group6: ["P69", "P70", "P71", "P72", "P73", "P74"], // P69 to P74, 3x2 grid

  group7: ["P75", "P76", "P78", "P79"], // 2x2 grid (P77 missing as noted)

  group8: ["P83", null, null, "P86"], // 1x2 grid (P84, P85 missing as noted)

  group9: ["P87", "P88", "P89", "P90"], // 4x1 grid

  group10: ["P91"], // Single seat

  group11: ["P92", "P93", "P94", "P95"], // P92 to P95, 4x1 grid

  group12: [
    "P96",
    "P97",
    "P98",
    "P99",
    "P100",
    "P101",
    "P102",
    "P103",
    "P104",
    "P105",
    "P106",
    null,
  ], // P96 to P106 with null at the end, 3x4 grid
};

export const GREENOCEAN_ROYAL_SEATS = {
  group1: [
    "R1",
    "R2",
    "R3",
    "R4",
    null,
    "R5",
    "R7",
    "R8",
    null,
    "R9",
    "R10",
    "R11",
  ], // 4x3 grid
  group2: ["R12", "R13", "R14", "R15",
    "R16", "R17", "R18", null, "R19", "R20", "R21", null
  ], // 4x3 grid
  group3: [null, "R22", "R23", "R24", "R25", "R26", "R27", "R28", "R29", "R30", "R31", "R32", "R33", "R34", "R35"], // 3x5 grid
  group4: ["R36", "R37", null, "R38", "R39", "R40", "R41", "R42", "R43", "R44", "R45", "R46", "R47", "R48", "R49"] // 3x5 grid
};

// Makruzz Pearl Premium seat mappings
// Layout: 4 column groups (ABC | DEFG | HIJK | LMN)
// Upper deck: P1-P8, Lower deck: P9-P22
// Gap/stairs between decks

export const MAKRUZZ_PEARL_PREMIUM_SEATS = {
  // === UPPER DECK ===
  // Group 1: ABC, rows 1-7 (3 cols × 7 rows = 21 seats)
  group1: [
    "P1A", "P1B", "P1C",
    "P2A", "P2B", "P2C",
    "P3A", "P3B", "P3C",
    "P4A", "P4B", "P4C",
    "P5A", "P5B", "P5C",
    "P6A", "P6B", "P6C",
    "P7A", "P7B", "P7C",
  ],
  // Group 2: DEFG, rows 1-8 (4 cols × 8 rows = 32 seats)
  group2: [
    "P1D", "P1E", "P1F", "P1G",
    "P2D", "P2E", "P2F", "P2G",
    "P3D", "P3E", "P3F", "P3G",
    "P4D", "P4E", "P4F", "P4G",
    "P5D", "P5E", "P5F", "P5G",
    "P6D", "P6E", "P6F", "P6G",
    "P7D", "P7E", "P7F", "P7G",
    "P8D", "P8E", "P8F", "P8G",
  ],
  // Group 3: HIJK, rows 1-8 (4 cols × 8 rows = 32 seats, H present in all rows)
  group3: [
    "P1H", "P1I", "P1J", "P1K",
    "P2H", "P2I", "P2J", "P2K",
    "P3H", "P3I", "P3J", "P3K",
    "P4H", "P4I", "P4J", "P4K",
    "P5H", "P5I", "P5J", "P5K",
    "P6H", "P6I", "P6J", "P6K",
    "P7H", "P7I", "P7J", "P7K",
    "P8H", "P8I", "P8J", "P8K",
  ],
  // Group 4: LMN, rows 1-7 (3 cols × 7 rows = 21 seats)
  group4: [
    "P1L", "P1M", "P1N",
    "P2L", "P2M", "P2N",
    "P3L", "P3M", "P3N",
    "P4L", "P4M", "P4N",
    "P5L", "P5M", "P5N",
    "P6L", "P6M", "P6N",
    "P7L", "P7M", "P7N",
  ],

  // === LOWER DECK ===
  // Group 5: ABC, rows 10-20 (3 cols × 11 rows = 33 seats)
  group5: [
    "P10A", "P10B", "P10C",
    "P11A", "P11B", "P11C",
    "P12A", "P12B", "P12C",
    "P13A", "P13B", "P13C",
    "P14A", "P14B", "P14C",
    "P15A", "P15B", "P15C",
    "P16A", "P16B", "P16C",
    "P17A", "P17B", "P17C",
    "P18A", "P18B", "P18C",
    "P19A", "P19B", "P19C",
    "P20A", "P20B", "P20C",
  ],
  // Group 6: DEF(G), rows 9-19 (varying width)
  // Rows 9-12: only DEF (3 cols), Rows 13: has no G in PDF... but Rows 14-19: DEFG
  group6: [
    "P9D", "P9E", "P9F", null,
    "P10D", "P10E", "P10F", null,
    "P11D", "P11E", "P11F", null,
    "P12D", "P12E", "P12F", null,
    "P13D", "P13E", "P13F", "P13G",
    "P14D", "P14E", "P14F", "P14G",
    "P15D", "P15E", "P15F", "P15G",
    "P16D", "P16E", "P16F", "P16G",
    "P17D", "P17E", "P17F", "P17G",
    "P18D", "P18E", "P18F", "P18G",
    "P19D", "P19E", "P19F", "P19G",
  ],
  // Group 7: (H)IJK, rows 9-19 (varying width)
  // Rows 9-12: only IJK (no H), Rows 13-19: HIJK
  group7: [
    null, "P9I", "P9J", "P9K",
    null, "P10I", "P10J", "P10K",
    null, "P11I", "P11J", "P11K",
    null, "P12I", "P12J", "P12K",
    "P13H", "P13I", "P13J", "P13K",
    "P14H", "P14I", "P14J", "P14K",
    "P15H", "P15I", "P15J", "P15K",
    "P16H", "P16I", "P16J", "P16K",
    "P17H", "P17I", "P17J", "P17K",
    "P18H", "P18I", "P18J", "P18K",
    "P19H", "P19I", "P19J", "P19K",
  ],
  // Group 8: LMN, rows 10-20 (3 cols × 11 rows = 33 seats)
  group8: [
    "P10L", "P10M", "P10N",
    "P11L", "P11M", "P11N",
    "P12L", "P12M", "P12N",
    "P13L", "P13M", "P13N",
    "P14L", "P14M", "P14N",
    "P15L", "P15M", "P15N",
    "P16L", "P16M", "P16N",
    "P17L", "P17M", "P17N",
    "P18L", "P18M", "P18N",
    "P19L", "P19M", "P19N",
    "P20L", "P20M", "P20N",
  ],

  // === BOTTOM ROWS (P21-P22, only outer columns) ===
  // Group 9: ABC rows 21-22
  group9: [
    "P21A", "P21B", "P21C",
    "P22A", "P22B", "P22C",
  ],
  // Group 10: LMN rows 21-22
  group10: [
    "P21L", "P21M", "P21N",
    "P22L", "P22M", "P22N",
  ],
};

// ============================================================
// Makruzz (Regular Vessel) — Premium Class
// ============================================================
// Layout (from screenshot):
//   Upper section (P1–P16, no P13):
//     Col groups: ABC | EFG | HIJ | LMN
//     Inner groups (EFG, HIJ) start at P1 one visual row ABOVE outer groups (ABC, LMN)
//     Inner groups run P1–P12, P14 only (14 rows)
//     Outer groups run P1–P12, P14–P16 (15 rows, no P13)
//   Gap between sections
//   Lower section (P17–P21):
//     Left:  ABCD (4 cols × 5 rows)
//     Right: KLMN (4 cols × 5 rows)
// ============================================================

export const MAKRUZZ_PREMIUM_SEATS = {

  // ─── UPPER SECTION ──────────────────────────────────────────
  // Group A: EFG inner-left (rows P1–P12, P14) — 3 cols × 13 rows = 39 seats
  // NOTE: This group renders 1 visual row ABOVE group B (ABC outer-left)
  groupA: [
    "P1E", "P1F", "P1G",
    "P2E", "P2F", "P2G",
    "P3E", "P3F", "P3G",
    "P4E", "P4F", "P4G",
    "P5E", "P5F", "P5G",
    "P6E", "P6F", "P6G",
    "P7E", "P7F", "P7G",
    "P8E", "P8F", "P8G",
    "P9E", "P9F", "P9G",
    "P10E", "P10F", "P10G",
    "P11E", "P11F", "P11G",
    "P12E", "P12F", "P12G",
    "P14E", "P14F", "P14G",
  ],

  // Group B: ABC outer-left (rows P1–P12, P14–P16) — 3 cols × 15 rows = 45 seats
  // Rendered 1 visual row BELOW groupA
  groupB: [
    "P1A", "P1B", "P1C",
    "P2A", "P2B", "P2C",
    "P3A", "P3B", "P3C",
    "P4A", "P4B", "P4C",
    "P5A", "P5B", "P5C",
    "P6A", "P6B", "P6C",
    "P7A", "P7B", "P7C",
    "P8A", "P8B", "P8C",
    "P9A", "P9B", "P9C",
    "P10A", "P10B", "P10C",
    "P11A", "P11B", "P11C",
    "P12A", "P12B", "P12C",
    "P14A", "P14B", "P14C",
    "P15A", "P15B", "P15C",
    "P16A", "P16B", "P16C",
  ],

  // Group C: HIJ inner-right (rows P1–P12, P14) — 3 cols × 13 rows = 39 seats
  // Rendered at same visual position as groupA (1 row above outer groups)
  groupC: [
    "P1H", "P1I", "P1J",
    "P2H", "P2I", "P2J",
    "P3H", "P3I", "P3J",
    "P4H", "P4I", "P4J",
    "P5H", "P5I", "P5J",
    "P6H", "P6I", "P6J",
    "P7H", "P7I", "P7J",
    "P8H", "P8I", "P8J",
    "P9H", "P9I", "P9J",
    "P10H", "P10I", "P10J",
    "P11H", "P11I", "P11J",
    "P12H", "P12I", "P12J",
    "P14H", "P14I", "P14J",
  ],

  // Group D: LMN outer-right (rows P1–P12, P14–P16) — 3 cols × 15 rows = 45 seats
  // Same visual alignment as groupB
  groupD: [
    "P1L", "P1M", "P1N",
    "P2L", "P2M", "P2N",
    "P3L", "P3M", "P3N",
    "P4L", "P4M", "P4N",
    "P5L", "P5M", "P5N",
    "P6L", "P6M", "P6N",
    "P7L", "P7M", "P7N",
    "P8L", "P8M", "P8N",
    "P9L", "P9M", "P9N",
    "P10L", "P10M", "P10N",
    "P11L", "P11M", "P11N",
    "P12L", "P12M", "P12N",
    "P14L", "P14M", "P14N",
    "P15L", "P15M", "P15N",
    "P16L", "P16M", "P16N",
  ],

  // ─── LOWER SECTION ──────────────────────────────────────────
  // Group E: ABCD outer-left (rows P17–P21) — 4 cols × 5 rows = 20 seats
  groupE: [
    "P17A", "P17B", "P17C", "P17D",
    "P18A", "P18B", "P18C", "P18D",
    "P19A", "P19B", "P19C", "P19D",
    "P20A", "P20B", "P20C", "P20D",
    "P21A", "P21B", "P21C", "P21D",
  ],

  // Group F: KLMN outer-right (rows P17–P21) — 4 cols × 5 rows = 20 seats
  groupF: [
    "P17K", "P17L", "P17M", "P17N",
    "P18K", "P18L", "P18M", "P18N",
    "P19K", "P19L", "P19M", "P19N",
    "P20K", "P20L", "P20M", "P20N",
    "P21K", "P21L", "P21M", "P21N",
  ],
};

// ============================================================
// Makruzz (Regular Vessel) — Deluxe Class
// ============================================================
// Layout (from screenshot):
//   Total 8 rows.
//   Left block: D1A-D1C to D8A-D8C (8 rows, 3 cols)
//   Middle block: D1D-D1G to D4D-D4G (4 rows, 4 cols). Aligned with outer rows 2, 3, 4, 5.
//   Right block: D1H-D1J to D8H-D8J (8 rows, 3 cols)
// ============================================================

export const MAKRUZZ_DELUXE_SEATS = {
  // Group A: Left block, 3 cols * 8 rows
  groupA: [
    "D1A", "D1B", "D1C",
    "D2A", "D2B", "D2C",
    "D3A", "D3B", "D3C",
    "D4A", "D4B", "D4C",
    "D5A", "D5B", "D5C",
    "D6A", "D6B", "D6C",
    "D7A", "D7B", "D7C",
    "D8A", "D8B", "D8C",
  ],
  // Group B: Middle block, 4 cols * 4 rows. 
  // Visually starts at row 2 so we prefix 1 row of nulls (1 row * 4 cols)
  // and postfix 3 rows of nulls (3 rows * 4 cols) to match the 8-row grid height.
  groupB: [
    null, null, null, null,
    "D1D", "D1E", "D1F", "D1G",
    "D2D", "D2E", "D2F", "D2G",
    "D3D", "D3E", "D3F", "D3G",
    "D4D", "D4E", "D4F", "D4G",
    null, null, null, null,
    null, null, null, null,
    null, null, null, null,
  ],
  // Group C: Right block, 3 cols * 8 rows
  groupC: [
    "D1H", "D1I", "D1J",
    "D2H", "D2I", "D2J",
    "D3H", "D3I", "D3J",
    "D4H", "D4I", "D4J",
    "D5H", "D5I", "D5J",
    "D6H", "D6I", "D6J",
    "D7H", "D7I", "D7J",
    "D8H", "D8I", "D8J",
  ],
  // === ROYAL CLASS ===
  // Group D: Left Royal 2x3. Visual gap in the middle row.
  groupD: [
    "R1A", "R1B",
    null, null,
    "R1D", "R1C", // Note: The screenshot labels these R1D R1C, preserving exact names.
  ],
  // Group E: Right Royal 2x3.
  groupE: [
    "R2A", "R2B",
    null, null,
    "R2D", "R2C",
  ]
};

export const MAKRUZZ_GOLD_PREMIUM_SEATS = {
  // === GOLD PREMIUM CLASS ===
  // Group A: Left Top (Rows 4-10, 3 columns: A-C)
  groupA: [
    null, "P4B", "P4C",
    null, "P5B", "P5C",
    null, "P6B", "P6C",
    null, "P7B", "P7C",
    "P8A", "P8B", "P8C",
    "P9A", "P9B", "P9C",
    "P10A", "P10B", "P10C",
  ],
  // Group B: Top Middle (Rows 1-11, 8 columns: D-K)
  groupB: [
    null, "P1E", "P1F", "P1G", "P1H", "P1I", "P1J", null,
    null, "P2E", "P2F", "P2G", "P2H", "P2I", "P2J", null,
    "P3D", "P3E", "P3F", "P3G", "P3H", "P3I", "P3J", "P3K",
    "P4D", "P4E", "P4F", "P4G", "P4H", "P4I", "P4J", "P4K",
    "P5D", "P5E", "P5F", "P5G", "P5H", "P5I", "P5J", "P5K",
    "P6D", "P6E", "P6F", "P6G", "P6H", "P6I", "P6J", "P6K",
    "P7D", "P7E", "P7F", "P7G", "P7H", "P7I", "P7J", "P7K",
    "P8D", "P8E", "P8F", "P8G", "P8H", "P8I", "P8J", "P8K",
    "P9D", "P9E", "P9F", "P9G", "P9H", "P9I", "P9J", "P9K",
    "P10D", "P10E", "P10F", "P10G", "P10H", "P10I", "P10J", "P10K",
    "P11D", "P11E", "P11F", "P11G", "P11H", "P11I", "P11J", "P11K",
  ],
  // Group C: Right Top (Rows 4-10, 3 columns: L-N)
  groupC: [
    "P4L", "P4M", null,
    "P5L", "P5M", null,
    "P6L", "P6M", null,
    "P7L", "P7M", null,
    "P8L", "P8M", "P8N",
    "P9L", "P9M", "P9N",
    "P10L", "P10M", "P10N",
  ],
  // Group D: Left Bottom (Rows 12, 14-24, 3 columns: A-C)
  groupD: [
    "P12A", "P12B", "P12C",
    "P14A", "P14B", "P14C",
    "P15A", "P15B", "P15C",
    "P16A", "P16B", "P16C",
    "P17A", "P17B", "P17C",
    "P18A", "P18B", "P18C",
    "P19A", "P19B", "P19C",
    "P20A", "P20B", "P20C",
    "P21A", "P21B", "P21C",
    "P22A", "P22B", "P22C",
    "P23A", "P23B", "P23C",
    "P24A", "P24B", "P24C",
  ],
  // Group E: Middle Bottom (Rows 17-25, 8 columns: D-K)
  groupE: [
    "P17D", "P17E", "P17F", "P17G", "P17H", "P17I", "P17J", "P17K",
    "P18D", "P18E", "P18F", "P18G", "P18H", "P18I", "P18J", "P18K",
    "P19D", "P19E", "P19F", "P19G", "P19H", "P19I", "P19J", "P19K",
    "P20D", "P20E", "P20F", "P20G", "P20H", "P20I", "P20J", "P20K",
    "P21D", "P21E", "P21F", "P21G", "P21H", "P21I", "P21J", "P21K",
    "P22D", "P22E", "P22F", "P22G", "P22H", "P22I", "P22J", "P22K",
    "P23D", "P23E", "P23F", "P23G", "P23H", "P23I", "P23J", "P23K",
    "P24D", "P24E", "P24F", "P24G", "P24H", "P24I", "P24J", "P24K",
    "P25D", "P25E", "P25F", "P25G", "P25H", "P25I", "P25J", "P25K",
  ],
  // Group F: Right Bottom (Rows 12, 14-24, 3 columns: L-N)
  groupF: [
    "P12L", "P12M", "P12N",
    "P14L", "P14M", "P14N",
    "P15L", "P15M", "P15N",
    "P16L", "P16M", "P16N",
    "P17L", "P17M", "P17N",
    "P18L", "P18M", "P18N",
    "P19L", "P19M", "P19N",
    "P20L", "P20M", "P20N",
    "P21L", "P21M", "P21N",
    "P22L", "P22M", "P22N",
    "P23L", "P23M", "P23N",
    "P24L", "P24M", "P24N",
  ]
};

export const MAKRUZZ_GOLD_DELUXE_SEATS = {
  // === GOLD DELUXE & ROYAL CLASS ===
  // Group A: Left Deluxe (Rows 1-9, 2 columns)
  groupA: [
    "D1A", "D1B",
    "D2A", "D2B",
    "D3A", "D3B",
    "D4A", "D4B",
    "D5A", "D5B",
    "D6A", "D6B",
    "D7A", "D7B",
    "D8A", "D8B",
    "D9A", "D9B",
  ],
  // Group B: Middle Deluxe (Rows 1-9, 3 columns). Rows 1 and 3 are empty.
  groupB: [
    null, null, null,
    "D2C", "D2D", "D2E",
    null, null, null,
    "D4C", "D4D", "D4E",
    "D5C", "D5D", "D5E",
    "D6C", "D6D", "D6E",
    "D7C", "D7D", "D7E",
    "D8C", "D8D", "D8E",
    "D9C", "D9D", "D9E",
  ],
  // Group C: Right Deluxe (Rows 1-12, 2 columns)
  groupC: [
    "D1F", "D1G",
    "D2F", "D2G",
    "D3F", "D3G",
    "D4F", "D4G",
    "D5F", "D5G",
    "D6F", "D6G",
    "D7F", "D7G",
    "D8F", "D8G",
    "D9F", "D9G",
    "D10F", "D10G",
    "D11F", "D11G",
    "D12F", "D12G",
  ],
  // === ROYAL CLASS ===
  // Group D: Left Royal (Rows 11-12, 2 columns)
  groupD: [
    "R1A", "R1B",
    "R1C", "R1D",
  ],
  // Group E: Middle Royal (Rows 11-12, 2 columns). Aligns under D2C, D2D.
  groupE: [
    "R2A", "R2B",
    "R2C", "R2D",
  ]
};