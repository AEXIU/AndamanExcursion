"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Section } from "@/components/layout";
import styles from "./PnrLookup.module.css";

interface PnrLookupResult {
  success: boolean;
  booking: {
    bookingId: string;
    confirmationNumber: string;
    customerName: string;
    status: string;
    bookingDate: string;
  };
  pdf: {
    url: string;
    fileName: string;
  } | null;
}

export const PnrLookup = () => {
  const [pnr, setPnr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PnrLookupResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = pnr.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `/api/bookings/lookup-pnr?pnr=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No booking found");
        return;
      }

      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section className={styles.pnrSection} id="pnr-lookup">
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <h2 className={styles.title}>Check your ferry status</h2>
          <p className={styles.subtitle}>
            Enter your PNR Number / Booking ID to get your ferry ticket
          </p>

          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.inputWrapper}>
              <span className={styles.inputLabel}>Enter PNR/Booking ID here</span>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. AC9A91234"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
              />
            </div>
            <button
              className={styles.searchButton}
              type="submit"
              disabled={loading || !pnr.trim()}
              aria-label="Search PNR"
            >
              <svg
                className={styles.searchIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          {error && <p className={styles.errorText}>{error}</p>}

          {result && (
            <div className={styles.resultCard}>
              <p className={styles.resultInfo}>
                Booking ID <strong>{result.booking.confirmationNumber}</strong> —{" "}
                {result.booking.customerName}
              </p>

              {result.pdf ? (
                <div className={styles.resultActions}>
                  <a
                    className={styles.viewBtn}
                    href={result.pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View PDF
                  </a>
                  <a
                    className={styles.downloadBtn}
                    href={result.pdf.url}
                    download={result.pdf.fileName}
                  >
                    Download PDF
                  </a>
                </div>
              ) : (
                <p className={styles.noPdfText}>
                  PDF not available yet. Please try again later.
                </p>
              )}
            </div>
          )}
        </div>

        <div className={styles.rightColumn}>
          <Image
            src="/graphics/ferry_graphic.svg"
            alt="Ferry illustration"
            fill
            className={styles.ferryImage}
            priority
          />
        </div>
      </div>
    </Section>
  );
};
