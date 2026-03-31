"use client";
import React, { useState, useEffect } from "react";
import styles from "./FerryStatusIndicator.module.css";

interface OperatorStatus {
  status: "online" | "offline" | "error";
  message?: string;
}

interface FerryHealthResponse {
  operators: {
    sealink: OperatorStatus;
    makruzz: OperatorStatus;
    greenocean: OperatorStatus;
  };
  summary: {
    total: number;
    online: number;
    offline: number;
    error: number;
  };
}

interface FerryStatusIndicatorProps {
  variant?: "compact" | "detailed" | "dots-only";
  showLabels?: boolean;
  className?: string;
}

export function FerryStatusIndicator({
  variant = "compact",
  showLabels = true,
  className = "",
}: FerryStatusIndicatorProps) {
  const [healthStatus, setHealthStatus] = useState<FerryHealthResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch("/api/ferry?action=health");
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data);
        setLastChecked(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch ferry health status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();

    // Refresh every 60 seconds
    const interval = setInterval(fetchHealthStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: OperatorStatus["status"]) => {
    switch (status) {
      case "online":
        return "#22c55e"; // green-500
      case "offline":
        return "#f59e0b"; // amber-500
      case "error":
        return "#ef4444"; // red-500
      default:
        return "#6b7280"; // gray-500
    }
  };

  const getStatusIcon = (status: OperatorStatus["status"]) => {
    switch (status) {
      case "online":
        return "●";
      case "offline":
        return "●";
      case "error":
        return "●";
      default:
        return "●";
    }
  };

  const operatorLabels = {
    sealink: "Sealink",
    makruzz: "Makruzz",
    greenocean: "Green Ocean",
  };

  if (isLoading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loading}>
          <span className={styles.loadingDot}>●</span>
          <span className={styles.loadingDot}>●</span>
          <span className={styles.loadingDot}>●</span>
        </div>
      </div>
    );
  }

  if (!healthStatus) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.error}>Ferry status unavailable</div>
      </div>
    );
  }

  if (variant === "dots-only") {
    return (
      <div className={`${styles.container} ${styles.dotsOnly} ${className}`}>
        {Object.entries(healthStatus.operators).map(([operator, status]) => (
          <div
            key={operator}
            className={styles.dotWrapper}
            title={`${operatorLabels[operator as keyof typeof operatorLabels]
              }: ${status.status}${status.message ? ` - ${status.message}` : ""}`}
          >
            <span
              className={styles.statusDot}
              style={{ color: getStatusColor(status.status) }}
            >
              {getStatusIcon(status.status)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={`${styles.container} ${styles.detailed} ${className}`}>
        <div className={styles.header}>
          <h4>Ferry Operator Status</h4>
          {lastChecked && (
            <span className={styles.lastChecked}>
              Last checked: {lastChecked.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className={styles.operatorsList}>
          {Object.entries(healthStatus.operators).map(([operator, status]) => (
            <div key={operator} className={styles.operatorItem}>
              <span
                className={styles.statusDot}
                style={{ color: getStatusColor(status.status) }}
              >
                {getStatusIcon(status.status)}
              </span>
              <span className={styles.operatorName}>
                {operatorLabels[operator as keyof typeof operatorLabels]}
              </span>
              <span className={styles.operatorStatus}>{status.status}</span>
              {status.message && (
                <span className={styles.operatorMessage}>
                  - {status.message}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <span className={styles.summaryItem}>
            Online: {healthStatus.summary.online}
          </span>
          <span className={styles.summaryItem}>
            Offline: {healthStatus.summary.offline}
          </span>
          <span className={styles.summaryItem}>
            Error: {healthStatus.summary.error}
          </span>
        </div>
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div className={`${styles.container} ${styles.compact} ${className}`}>
      <div className={styles.statusRow}>
        {Object.entries(healthStatus.operators).map(([operator, status]) => (
          <div
            key={operator}
            className={styles.operatorCompact}
            title={`${operatorLabels[operator as keyof typeof operatorLabels]
              }: ${status.status}${status.message ? ` - ${status.message}` : ""}`}
          >
            <span
              className={styles.statusDot}
              style={{ color: getStatusColor(status.status) }}
            >
              {getStatusIcon(status.status)}
            </span>
            {showLabels && (
              <span className={styles.operatorLabel}>
                {operatorLabels[operator as keyof typeof operatorLabels]}
              </span>
            )}
          </div>
        ))}
      </div>

      {lastChecked && (
        <div className={styles.timestamp}>
          Updated: {lastChecked.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
