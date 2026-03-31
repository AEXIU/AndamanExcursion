import { FerryBookingSession } from "./FerryBookingSession.types";

declare global {
  var bookingSessions: Map<string, FerryBookingSession> | undefined;
}

export {};
