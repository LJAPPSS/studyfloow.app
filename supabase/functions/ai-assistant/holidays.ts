export type SchoolRegion = "noord" | "midden" | "zuid";

export type SchoolHoliday = {
  name: string;
  start: string;
  end: string;
  regions: SchoolRegion[];
};

const ALL: SchoolRegion[] = ["noord", "midden", "zuid"];

export const SCHOOL_HOLIDAYS: SchoolHoliday[] = [
  { name: "zomervakantie", start: "2026-07-04", end: "2026-08-16", regions: ["noord"] },
  { name: "zomervakantie", start: "2026-07-11", end: "2026-08-23", regions: ["zuid"] },
  { name: "zomervakantie", start: "2026-07-18", end: "2026-08-30", regions: ["midden"] },
  { name: "herfstvakantie", start: "2026-10-10", end: "2026-10-18", regions: ["noord"] },
  { name: "herfstvakantie", start: "2026-10-17", end: "2026-10-25", regions: ["midden", "zuid"] },
  { name: "kerstvakantie", start: "2026-12-19", end: "2027-01-03", regions: ALL },
  { name: "voorjaarsvakantie", start: "2027-02-20", end: "2027-02-28", regions: ["noord", "midden"] },
  { name: "voorjaarsvakantie", start: "2027-02-13", end: "2027-02-21", regions: ["zuid"] },
  { name: "meivakantie", start: "2027-04-24", end: "2027-05-02", regions: ALL },
  { name: "zomervakantie", start: "2027-07-10", end: "2027-08-22", regions: ["noord"] },
  { name: "zomervakantie", start: "2027-07-17", end: "2027-08-29", regions: ["midden"] },
  { name: "zomervakantie", start: "2027-07-24", end: "2027-09-05", regions: ["zuid"] },
  { name: "herfstvakantie", start: "2027-10-16", end: "2027-10-24", regions: ["noord", "midden"] },
  { name: "herfstvakantie", start: "2027-10-23", end: "2027-10-31", regions: ["zuid"] },
  { name: "kerstvakantie", start: "2027-12-25", end: "2028-01-09", regions: ALL },
  { name: "voorjaarsvakantie", start: "2028-02-19", end: "2028-02-27", regions: ["noord"] },
  { name: "voorjaarsvakantie", start: "2028-02-26", end: "2028-03-05", regions: ["midden", "zuid"] },
  { name: "meivakantie", start: "2028-04-29", end: "2028-05-07", regions: ALL },
  { name: "zomervakantie", start: "2028-07-15", end: "2028-08-27", regions: ["noord"] },
  { name: "zomervakantie", start: "2028-07-08", end: "2028-08-20", regions: ["midden"] },
  { name: "zomervakantie", start: "2028-07-22", end: "2028-09-03", regions: ["zuid"] },
];
