"use client";
import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactForm } from "./components/ContactForm/ContactForm";

import styles from "./page.module.css";
import {
  contactFormSchema,
  ContactFormData,
  createFormDefaults, // Import the new function
} from "./components/ContactForm/ContactForm.types";
import { SectionTitle } from "@/components/atoms";
import { Container } from "@/components/layout";
import {
  Package,
  Calendar,
  IndianRupee,
  FileText,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Info,
} from "lucide-react";
import { useEnquiryData } from "@/hooks/contact/useEnquiryData";
import { useFormPersistence } from "@/hooks/contact/useFormPersistence";

type FormInitState =
  | "loading"
  | "package"
  | "saved"
  | "fresh"
  | "conflict"
  | "error";

// Component that uses useEnquiryData (wrapped in Suspense)
function ContactPageContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [initState, setInitState] = useState<FormInitState>("loading");
  const [conflictData, setConflictData] = useState<{
    saved: ContactFormData;
    package: ContactFormData;
  } | null>(null);

  // Track initialization to prevent multiple runs
  const hasInitialized = useRef(false);
  const initializationPromise = useRef<Promise<void> | null>(null);

  // Get package enquiry data from URL parameters
  const {
    formDefaults,
    hasPackageData,
    packageInfo,
    isLoading,
    contactFormOptions,
    error: enquiryError,
    isDataReady,
  } = useEnquiryData();

  // Create form with enhanced defaults
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema) as any,
    mode: "onChange",
    defaultValues: createFormDefaults(), // Use the factory function
  });

  const {
    saveToStorage,
    loadFromStorage,
    clearStorage,
    restoreFromStorage,
    savePackageData,
    hasConflictingData,
    getStorageInfo,
    hasStoredData,
    isStorageAvailable,
  } = useFormPersistence(form);

  // Enhanced form initialization with race condition prevention
  useEffect(() => {
    if (
      !isDataReady ||
      hasInitialized.current ||
      initializationPromise.current
    ) {
      return;
    }

    const initializeForm = async (): Promise<void> => {
      try {
        console.log("🔄 Initializing form...");
        hasInitialized.current = true;

        // Check storage availability first
        if (!isStorageAvailable()) {
          console.warn("⚠️ Storage not available, using memory only");
          if (hasPackageData && formDefaults) {
            await applyFormData(formDefaults, "package");
            setInitState("package");
          } else {
            setInitState("fresh");
          }
          return;
        }

        // 1. Check for package data first
        if (hasPackageData && formDefaults) {
          console.log("📦 Package data available");

          // Check for conflicts with saved data
          if (hasConflictingData(formDefaults)) {
            const savedData = loadFromStorage();
            if (savedData) {
              setConflictData({
                saved: savedData.data,
                package: formDefaults,
              });
              setInitState("conflict");
              return;
            }
          }

          // No conflicts - use package data
          await applyFormData(formDefaults, "package");
          await savePackageData(formDefaults);
          setInitState("package");
        } else if (hasStoredData()) {
          // 2. Try to load saved data
          const restored = restoreFromStorage();
          if (restored) {
            console.log("💾 Using saved form data");
            setInitState("saved");
          } else {
            console.log("✨ Using fresh form");
            setInitState("fresh");
          }
        } else {
          console.log("✨ Using fresh form");
          setInitState("fresh");
        }
      } catch (error) {
        console.error("❌ Error initializing form:", error);
        setInitState("error");
      } finally {
        initializationPromise.current = null;
      }
    };

    // Store the promise to prevent concurrent initializations
    initializationPromise.current = initializeForm();
  }, [
    isDataReady,
    hasPackageData,
    formDefaults,
    hasConflictingData,
    loadFromStorage,
    restoreFromStorage,
    savePackageData,
    hasStoredData,
    isStorageAvailable,
  ]);

  // Helper function to apply form data with proper type conversion and timing
  const applyFormData = useCallback(
    async (data: ContactFormData, source: "package" | "saved") => {
      // Use the enhanced defaults as base, then overlay with provided data
      const baseDefaults = createFormDefaults();
      const mergedData = {
        ...baseDefaults,
        ...data,
        booking: { ...baseDefaults.booking, ...data.booking },
        personal: { ...baseDefaults.personal, ...data.personal },
        additional: { ...baseDefaults.additional, ...data.additional },
      };

      // Process and ensure proper types
      const processedData = {
        ...mergedData,
        personal: {
          ...mergedData.personal,
          age: Number(mergedData.personal.age),
        },
        booking: {
          ...mergedData.booking,
          adults: Number(mergedData.booking.adults),
          children: Number(mergedData.booking.children),
          checkIn: new Date(mergedData.booking.checkIn),
          checkOut: new Date(mergedData.booking.checkOut),
        },
      };

      // Apply immediate values first (non-select fields)
      const immediateFields = [
        "booking.checkIn",
        "booking.checkOut",
        "booking.adults",
        "booking.children",
        "additional.message",
        "personal.fullName",
        "personal.email",
        "personal.phone",
        "personal.age",
        "additionalMessage",
      ] as const;

      immediateFields.forEach((fieldPath) => {
        const value = getNestedValue(processedData, fieldPath);
        if (value !== undefined) {
          form.setValue(fieldPath, value, {
            shouldDirty: source === "saved",
            shouldValidate: false,
          });
        }
      });

      // Small delay for select components to mount properly
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Apply select field values
      const selectFields = ["booking.package", "booking.duration"] as const;
      selectFields.forEach((fieldPath) => {
        const value = getNestedValue(processedData, fieldPath);
        if (value !== undefined) {
          form.setValue(fieldPath, value, {
            shouldDirty: source === "saved",
            shouldValidate: false,
          });
        }
      });

      // Apply tags separately (array field)
      if (processedData.additional.tags.length > 0) {
        form.setValue("additional.tags", processedData.additional.tags, {
          shouldDirty: source === "saved",
          shouldValidate: false,
        });
      }

      // Trigger validation after all values are set
      setTimeout(() => {
        form.trigger();
        console.log(`✅ Applied ${source} data to form`);
      }, 150);
    },
    [form]
  );

  // Helper function to safely get nested object values
  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  // Handle conflict resolution with better error handling
  const handleConflictResolution = useCallback(
    async (choice: "package" | "saved") => {
      if (!conflictData) return;

      try {
        setInitState("loading"); // Show loading during resolution

        if (choice === "package") {
          clearStorage();
          await applyFormData(conflictData.package, "package");
          await savePackageData(conflictData.package);
          setInitState("package");
        } else {
          await applyFormData(conflictData.saved, "saved");
          setInitState("saved");
        }
        setConflictData(null);
      } catch (error) {
        console.error("Error resolving conflict:", error);
        setInitState("error");
      }
    },
    [conflictData, applyFormData, savePackageData, clearStorage]
  );

  // Enhanced onSubmit with proper error handling
  const onSubmit = useCallback(
    async (data: ContactFormData, recaptchaToken?: string): Promise<void> => {
      setIsSubmitting(true);
      setSubmitResult(null);

      try {
        console.log("📤 Submitting form data");

        // Step 1: Verify reCAPTCHA if token provided
        if (recaptchaToken) {
          try {
            const recaptchaResponse = await fetch("/api/verify-recaptcha", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: recaptchaToken,
                action: "contact_form",
              }),
            });

            const recaptchaResult = await recaptchaResponse.json();
            if (!recaptchaResult.success) {
              console.warn(
                "reCAPTCHA verification failed (proceeding anyway):",
                recaptchaResult.error
              );
            }
          } catch (recaptchaError) {
            console.warn("reCAPTCHA verification error (proceeding anyway):", recaptchaError);
          }
        }

        // Step 2: Prepare request payload with proper packageInfo handling
        const requestPayload = {
          ...data,
          enquirySource: hasPackageData ? "package-detail" : "direct",
          packageInfo: packageInfo || undefined, // Ensure not null
          timestamp: new Date().toISOString(),
          recaptchaScore: recaptchaToken ? "verified" : "skipped",
        };

        console.log("📋 Request payload prepared:", {
          hasPackageData,
          packageInfoPresent: !!requestPayload.packageInfo,
          personalAge: typeof data.personal.age,
          bookingAdults: typeof data.booking.adults,
          bookingChildren: typeof data.booking.children,
        });

        const response = await fetch("/api/contact?action=enquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        });

        const responseText = await response.text();

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || errorMessage;
            if (errorData.field) {
              errorMessage += ` (Field: ${errorData.field})`;
            }
          } catch (parseError) {
            console.warn("Could not parse error response:", parseError);
          }
          throw new Error(errorMessage);
        }

        const result = JSON.parse(responseText);

        setSubmitResult({
          success: true,
          message:
            result.message || "Your enquiry has been submitted successfully!",
          data: {
            enquiryId: result.enquiryId,
            estimatedResponseTime: result.estimatedResponseTime || "24 hours",
          },
        });

        // Clear form and storage on success
        clearStorage();
        form.reset(createFormDefaults()); // Reset to clean defaults
        hasInitialized.current = false; // Allow re-initialization
        setInitState("fresh");
      } catch (error) {
        console.error("❌ Form submission error:", error);
        setSubmitResult({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to submit enquiry. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, hasPackageData, packageInfo, clearStorage]
  );

  // Function to dismiss error and reset form state
  const handleDismissError = useCallback(() => {
    setSubmitResult(null);
  }, []);

  // Function to start fresh (clear all data)
  const handleStartFresh = useCallback(() => {
    clearStorage();
    form.reset(createFormDefaults());
    setInitState("fresh");
    console.log("🆕 Started fresh form");
  }, [form, clearStorage]);

  // Show loading state
  if (isLoading || initState === "loading") {
    return (
      <div className={styles.contactPage}>
        <Container className={styles.container}>
          <SectionTitle
            specialWord="Love to Hear"
            text="We'd Love to Hear from you!"
            className={styles.title}
          />
          <div className={styles.loading}>
            <Loader2 className={styles.loadingSpinner} />
            <p>
              {isLoading ? "Loading form options..." : "Initializing form..."}
            </p>
          </div>
        </Container>
      </div>
    );
  }

  // Show error state
  if (enquiryError || initState === "error") {
    return (
      <div className={styles.contactPage}>
        <Container className={styles.container}>
          <SectionTitle
            specialWord="Love to Hear"
            text="We'd Love to Hear from you!"
            className={styles.title}
          />
          <div className={styles.error}>
            <AlertTriangle className={styles.errorIcon} />
            <p>{enquiryError || "Failed to initialize form"}</p>
            <div className={styles.errorActions}>
              <button
                onClick={() => {
                  hasInitialized.current = false;
                  setInitState("loading");
                }}
                className={styles.retryButton}
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <button onClick={handleStartFresh} className={styles.freshButton}>
                Start Fresh
              </button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Show conflict resolution
  if (initState === "conflict" && conflictData) {
    return (
      <div className={styles.contactPage}>
        <Container className={styles.container}>
          <SectionTitle
            specialWord="Love to Hear"
            text="We'd Love to Hear from you!"
            className={styles.title}
          />

          <div className={styles.conflictResolution}>
            <div className={styles.conflictHeader}>
              <Info className={styles.conflictIcon} />
              <h3>Data Conflict Detected</h3>
            </div>

            <p>
              We found both saved form data and new package information. Which
              would you like to use?
            </p>

            <div className={styles.conflictOptions}>
              <div className={styles.conflictOption}>
                <h4>📦 New Package Data</h4>
                <div className={styles.conflictPreview}>
                  <p>
                    <strong>Package:</strong>{" "}
                    {conflictData.package.booking.package}
                  </p>
                  <p>
                    <strong>Duration:</strong>{" "}
                    {conflictData.package.booking.duration}
                  </p>
                  <p>
                    <strong>Guests:</strong>{" "}
                    {conflictData.package.booking.adults} adults,{" "}
                    {conflictData.package.booking.children} children
                  </p>
                </div>
                <button
                  onClick={() => handleConflictResolution("package")}
                  className={`${styles.conflictButton} ${styles.packageChoice}`}
                >
                  Use Package Data
                </button>
              </div>

              <div className={styles.conflictOption}>
                <h4>💾 Previously Saved Data</h4>
                <div className={styles.conflictPreview}>
                  <p>
                    <strong>Package:</strong>{" "}
                    {conflictData.saved.booking.package || "Not selected"}
                  </p>
                  <p>
                    <strong>Name:</strong>{" "}
                    {conflictData.saved.personal.fullName || "Not entered"}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {conflictData.saved.personal.email || "Not entered"}
                  </p>
                </div>
                <button
                  onClick={() => handleConflictResolution("saved")}
                  className={`${styles.conflictButton} ${styles.savedChoice}`}
                >
                  Use Saved Data
                </button>
              </div>
            </div>

            <button
              onClick={handleStartFresh}
              className={styles.startFreshButton}
            >
              Start Fresh Instead
            </button>
          </div>
        </Container>
      </div>
    );
  }

  // Debug info (remove in production)
  const storageInfo = getStorageInfo();

  return (
    <div className={styles.contactPage}>
      <Container className={styles.container}>
        <SectionTitle
          specialWord="Love to Hear"
          text="We'd Love to Hear from you!"
          className={styles.title}
        />

        {/* Development Debug Panel - Remove in production */}
        {process.env.NODE_ENV === "development" && storageInfo && (
          <div className={styles.debugPanel}>
            <p>
              🔍 Debug: {initState} | {storageInfo.source} ({storageInfo.age}min
              old, {storageInfo.size}KB, expires in {storageInfo.expires}min)
            </p>
          </div>
        )}

        {/* Package Enquiry Notice */}
        {initState === "package" && packageInfo && (
          <div className={styles.packageNotice}>
            <div className={styles.packageHeader}>
              <h3>
                <Package size={20} className={styles.packageIcon} />
                Package Enquiry
              </h3>
              <div className={styles.packageBadge}>From Package Details</div>
            </div>

            <div className={styles.packageDetails}>
              <h4>{packageInfo.title}</h4>
              <div className={styles.packageMeta}>
                {packageInfo.period && (
                  <span className={styles.packagePeriod}>
                    <Calendar size={16} />
                    {packageInfo.period}
                  </span>
                )}
                {packageInfo.price && (
                  <span className={styles.packagePrice}>
                    <IndianRupee size={16} />
                    {packageInfo.price.toLocaleString()}/adult
                  </span>
                )}
              </div>

              {packageInfo.description && (
                <p className={styles.packageDescription}>
                  {packageInfo.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Saved Data Notice */}
        {initState === "saved" && (
          <div className={styles.savedDataNotice}>
            <p>
              <FileText size={16} className={styles.savedDataIcon} />
              We've restored your previous form data.
              <button
                type="button"
                onClick={handleStartFresh}
                className={styles.clearDataButton}
              >
                Start Fresh
              </button>
            </p>
          </div>
        )}

        <ContactForm
          form={form}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitResult={submitResult}
          contactFormOptions={contactFormOptions}
          onDismissError={handleDismissError}
        />
      </Container>
    </div>
  );
}

// Loading component for Suspense fallback
function ContactPageLoading() {
  return (
    <div className={styles.contactPage}>
      <Container className={styles.container}>
        <SectionTitle
          specialWord="Love to Hear"
          text="We'd Love to Hear from you!"
          className={styles.title}
        />
        <div className={styles.loading}>
          <Loader2 className={styles.loadingSpinner} />
          <p>Loading form...</p>
        </div>
      </Container>
    </div>
  );
}

// Main component with Suspense boundary
export default function ContactPage() {
  return (
    <Suspense fallback={<ContactPageLoading />}>
      <ContactPageContent />
    </Suspense>
  );
}
