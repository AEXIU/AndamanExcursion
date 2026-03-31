// src/components/atoms/Recaptcha/Recaptcha.tsx
"use client";
import React, { useId, useEffect, useRef } from "react";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import styles from "./Recaptcha.module.css";

interface RecaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
}

export const Recaptcha: React.FC<RecaptchaProps> = ({
  siteKey,
  onVerify,
  onExpire,
  onError,
}) => {
  const uid = useId().replace(/:/g, "");
  const containerId = `recaptcha-container-${uid}`;
  const prevToken = useRef<string | null>(null);

  const { isLoaded, error, token } = useRecaptcha({ siteKey, containerId });

  // Notify parent when token is set (user ticked the box)
  useEffect(() => {
    if (token && token !== prevToken.current) {
      prevToken.current = token;
      onVerify(token);
    }
    // Token went from truthy to null → expired
    if (!token && prevToken.current) {
      prevToken.current = null;
      onExpire?.();
    }
  }, [token, onVerify, onExpire]);

  // Notify parent of errors
  useEffect(() => {
    if (error) onError?.(error);
  }, [error, onError]);

  return (
    <div className={styles.recaptchaBadge}>
      {/* Mount point for the v2 checkbox widget */}
      <div id={containerId} />

      {!isLoaded && !error && (
        <div className={styles.recaptchaText}>
          <span className={styles.loading}>⏳</span>
          Loading reCAPTCHA...
        </div>
      )}

      {error && (
        <div className={styles.recaptchaText}>
          <span className={styles.errorMark}>⚠</span>
          reCAPTCHA failed to load
        </div>
      )}
    </div>
  );
};
