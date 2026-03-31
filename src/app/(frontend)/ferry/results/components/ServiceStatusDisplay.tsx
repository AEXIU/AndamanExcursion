// ===== 1. Enhanced ServiceStatusDisplay.tsx =====
import React from "react";
import { AlertTriangle, XCircle, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/atoms";
import styles from "./ServiceStatusDisplay.module.css";

interface OperatorError {
  operator: string;
  error: string;
}

interface ServiceStatusDisplayProps {
  searchErrors: OperatorError[];
  isPartialFailure: boolean;
  isLoading: boolean;
  searchResultsCount: number;
  onRetry: () => void;
  onNewSearch?: () => void; // Optional prop for new search
}

export const ServiceStatusDisplay: React.FC<ServiceStatusDisplayProps> = ({
  searchErrors,
  isPartialFailure,
  isLoading,
  searchResultsCount,
  onRetry,
  onNewSearch,
}) => {
  // Don't show anything if no errors
  if (searchErrors.length === 0 && !isPartialFailure) return null;
  if (isLoading) return null;

  // Critical failure - no results available
  if (searchResultsCount === 0) {
    return (
      <div className={`${styles.serviceStatus} ${styles.criticalFailure}`}>
        <div className={styles.statusHeader}>
          <XCircle className={styles.errorIcon} size={24} />
          <div>
            <h3 className={styles.statusTitle}>No ferries available</h3>
            <p className={styles.statusSubtitle}>
              All ferry services are currently unavailable for your search
            </p>
          </div>
        </div>

        {searchErrors.length > 0 && (
          <div className={styles.errorDetails}>
            <p className={styles.errorDetailsTitle}>Service status:</p>
            <div className={styles.operatorList}>
              {searchErrors.map((error, index) => (
                <div key={index} className={styles.operatorError}>
                  <XCircle size={16} className={styles.operatorErrorIcon} />
                  <span className={styles.operatorName}>{error.operator}:</span>
                  <span className={styles.operatorErrorText}>
                    {error.error}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.statusActions}>
          <Button
            variant="primary"
            onClick={onRetry}
            disabled={isLoading}
            className={styles.retryButton}
          >
            <RefreshCw size={16} />
            {isLoading ? "Retrying..." : "Try Again"}
          </Button>
          {onNewSearch && (
            <Button variant="secondary" onClick={onNewSearch}>
              <Search size={16} />
              New Search
            </Button>
          )}
        </div>

        <p className={styles.supportNote}>
          If this problem persists, please contact our support team.
        </p>
      </div>
    );
  }

  // Partial failure - some results available
  return (
    <div className={`${styles.serviceStatus} ${styles.partialFailure}`}>
      <div className={styles.statusHeader}>
        <AlertTriangle className={styles.warningIcon} size={20} />
        <div>
          <h4 className={styles.statusTitle}>Some services unavailable</h4>
          <p className={styles.statusSubtitle}>
            Found {searchResultsCount} ferries from working operators
          </p>
        </div>
      </div>

      <details className={styles.errorDetails}>
        <summary className={styles.errorDetailsSummary}>
          View service status ({searchErrors.length} operators down)
        </summary>
        <div className={styles.operatorList}>
          {searchErrors.map((error, index) => (
            <div key={index} className={styles.operatorError}>
              <XCircle size={14} className={styles.operatorErrorIcon} />
              <span className={styles.operatorName}>{error.operator}:</span>
              <span className={styles.operatorErrorText}>{error.error}</span>
            </div>
          ))}
        </div>
      </details>

      <div className={styles.statusActions}>
        <Button
          variant="outline"
          size="small"
          onClick={onRetry}
          disabled={isLoading}
          className={styles.retryButton}
        >
          <RefreshCw size={14} />
          Retry All
        </Button>
      </div>
    </div>
  );
};
