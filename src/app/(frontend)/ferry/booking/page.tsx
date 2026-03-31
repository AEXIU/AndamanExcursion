"use client";
import { redirect } from "next/navigation";

export default function FerryBookingPage() {
  // This page is deprecated - redirect to the new ferry search flow
  redirect("/ferry");
}
