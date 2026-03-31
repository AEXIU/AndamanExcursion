import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement | string,
        parameters: { sitekey: string; callback?: (token: string) => void; "expired-callback"?: () => void; "error-callback"?: () => void; }
      ) => number;
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
    };
    onRecaptchaV2Loaded?: () => void;
  }
}

const SCRIPT_ID = "google-recaptcha-v2";

let scriptLoaded = false;
let scriptLoading = false;
let loadCallbacks: Array<() => void> = [];
let loadError: string | null = null;

function ensureScriptLoaded(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (scriptLoaded) { resolve(); return; }
    if (loadError) { reject(new Error(loadError)); return; }

    loadCallbacks.push(() => {
      if (loadError) reject(new Error(loadError));
      else resolve();
    });

    if (scriptLoading) return;
    scriptLoading = true;

    window.onRecaptchaV2Loaded = () => {
      scriptLoaded = true;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks = [];
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaV2Loaded&render=explicit`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      loadError = "Failed to load reCAPTCHA script.";
      scriptLoading = false;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks = [];
    };

    document.head.appendChild(script);
  });
}

interface UseRecaptchaV2Options {
  siteKey: string;
  containerId: string; // ID of the DOM element to render the widget into
}

export function useRecaptcha({ siteKey, containerId }: UseRecaptchaV2Options) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !siteKey || !containerId) return;

    let cancelled = false;

    ensureScriptLoaded()
      .then(() => {
        if (cancelled) return;

        const container = document.getElementById(containerId);
        if (!container || !window.grecaptcha) return;

        // Already rendered
        if (widgetIdRef.current !== null) return;

        widgetIdRef.current = window.grecaptcha.render(container, {
          sitekey: siteKey,
          callback: (responseToken: string) => {
            if (!cancelled) setToken(responseToken);
          },
          "expired-callback": () => {
            if (!cancelled) setToken(null);
          },
          "error-callback": () => {
            if (!cancelled) setError("reCAPTCHA verification error. Please try again.");
          },
        });

        setIsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load reCAPTCHA. Check your network.");
      });

    return () => {
      cancelled = true;
    };
  }, [siteKey, containerId]);

  const getToken = useCallback((): string | null => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      return window.grecaptcha.getResponse(widgetIdRef.current) || null;
    }
    return token;
  }, [token]);

  const resetCaptcha = useCallback(() => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetIdRef.current);
      setToken(null);
    }
  }, []);

  return {
    isLoaded,
    isReady: isLoaded && !error,
    error,
    token,
    getToken,
    resetCaptcha,
    isVerified: !!token,
  };
}
