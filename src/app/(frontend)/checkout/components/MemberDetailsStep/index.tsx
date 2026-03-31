"use client";

import React, { useMemo, useEffect, useState } from "react";
import {
  useForm,
  FormProvider,
  useFieldArray,
  Controller,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/atoms/Button/Button";
import { Input } from "@/components/atoms/Input/Input";
import { PhoneInput } from "@/components/atoms/PhoneInput/PhoneInput";
import { Select } from "@/components/atoms/Select/Select";
import { useCheckoutStore } from "@/store/CheckoutStore";
import type {
  UnifiedBookingData,
  PassengerRequirements,
} from "@/utils/CheckoutAdapter";
import type { CheckoutFormData } from "@/store/CheckoutStore";
import {
  COUNTRIES,
  GENDER_OPTIONS,
  DEFAULT_VALUES,
  NATIONALITY_TO_COUNTRY_CODE,
} from "@/constants";
import styles from "./MemberDetailsStep.module.css";
import { DateSelect, SectionTitle } from "@/components/atoms";
import { Ship, Target } from "lucide-react";

// Enhanced schema for member details with conditional foreign passenger fields
const memberSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters"),
    age: z.coerce
      .number()
      .int("Age must be a whole number")
      .min(1, "Age must be at least 1")
      .max(120, "Age must not exceed 120"),
    gender: z.enum(["Male", "Female", "Other"], {
      errorMap: () => ({ message: "Please select a gender" }),
    }),
    nationality: z.string().min(1, "Please select nationality"),
    passportNumber: z.string().optional(), // Made optional since only foreign passengers need it
    whatsappNumber: z.string().optional(),
    phoneCountryCode: z.string().optional(), // NEW: Store country code (+91, +1, etc.)
    phoneCountry: z.string().optional(), // NEW: Store country name (India, USA, etc.)
    email: z.string().email("Please enter a valid email").optional(),
    selectedBookings: z
      .array(z.number())
      .min(1, "Please assign to at least one booking"),
    // Foreign passenger fields for Makruzz (conditional based on nationality)
    fcountry: z.string().optional(),
    fpassport: z.string().optional(),
    fexpdate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Enhanced validation for foreign passengers with specific field errors
    const isForeigner = data.nationality !== "Indian";

    if (isForeigner) {
      // Validate passport number
      if (!data.fpassport || data.fpassport.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passport number is required for foreign passengers",
          path: ["fpassport"],
        });
      } else if (data.fpassport.trim().length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passport number must be at least 6 characters",
          path: ["fpassport"],
        });
      } else if (!/^[A-Z0-9]+$/i.test(data.fpassport.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passport number can only contain letters and numbers",
          path: ["fpassport"],
        });
      }

      // Validate passport expiry date
      if (!data.fexpdate || data.fexpdate.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passport expiry date is required for foreign passengers",
          path: ["fexpdate"],
        });
      } else {
        const expiryDate = new Date(data.fexpdate);
        const today = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(today.getMonth() + 6);

        if (isNaN(expiryDate.getTime())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please enter a valid expiry date",
            path: ["fexpdate"],
          });
        } else if (expiryDate <= sixMonthsFromNow) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Passport must be valid for at least 6 months from travel date",
            path: ["fexpdate"],
          });
        }
      }
    }
  });

const formSchema = z.object({
  members: z.array(memberSchema).min(1, "At least one passenger is required"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface MemberDetailsStepProps {
  bookingData: UnifiedBookingData;
  requirements: PassengerRequirements;
}

export const MemberDetailsStep: React.FC<MemberDetailsStepProps> = ({
  bookingData,
  requirements,
}) => {
  const { formData, updateFormData, nextStep, setError, setLoading } =
    useCheckoutStore();

  // Add checkout protection for step 1

  // Create form defaults
  const defaultValues = useMemo(() => {
    console.log("🔍 Creating default values with requirements:", requirements);
    console.log("🔍 Total Required Passengers:", requirements.totalRequired);

    // ✅ FIX: Check if existing formData matches requirements
    if (formData && formData.members.length === requirements.totalRequired) {
      console.log("🔍 Using existing formData with", formData.members.length, "members");
      return {
        members: formData.members.map((member) => ({
          fullName: member.fullName || "",
          age: member.age || ("" as unknown as number),
          gender: member.gender || ("" as unknown as "Male"),
          nationality: member.nationality || "Indian",
          passportNumber: member.passportNumber || undefined,
          whatsappNumber: member.whatsappNumber || "",
          phoneCountryCode: member.phoneCountryCode || "+91", // NEW
          phoneCountry: member.phoneCountry || "India", // NEW
          email: member.email || "",
          selectedBookings: member.selectedBookings || [0],
          // Foreign passenger fields for Makruzz
          fcountry: member.fcountry || "",
          fpassport: member.fpassport || "",
          fexpdate: member.fexpdate || "",
        })),
        termsAccepted: formData.termsAccepted,
      };
    }

    // ✅ If formData exists but doesn't match requirements, ignore it and create fresh

    // Create defaults based on requirements
    console.log("🔍 Creating new members array with length:", requirements.totalRequired);
    const members = Array.from(
      { length: requirements.totalRequired },
      (_, i) => ({
        fullName: "",
        age: "" as unknown as number,
        gender: "" as unknown as "Male",
        nationality: DEFAULT_VALUES.NATIONALITY,
        passportNumber: undefined,
        whatsappNumber: i === 0 ? "" : undefined,
        phoneCountryCode:
          i === 0 ? DEFAULT_VALUES.PHONE_COUNTRY_CODE : undefined,
        phoneCountry: i === 0 ? DEFAULT_VALUES.PHONE_COUNTRY : undefined,
        email: i === 0 ? "" : undefined,
        selectedBookings: [0],
        // Initialize foreign passenger fields
        fcountry: "",
        fpassport: "",
        fexpdate: "",
      })
    );

    return {
      members,
      termsAccepted: false,
    };
  }, [formData, requirements.totalRequired]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange", // Changed to onChange for better validation feedback
  });

  const {
    control,
    handleSubmit,
    watch,
    trigger, // Add trigger for manual validation
    formState: { errors, isValid, isSubmitting },
  } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "members",
  });
  const watchedMembers = watch("members");

  // ✅ NEW: Watch for nationality changes and update country code automatically
  useEffect(() => {
    watchedMembers.forEach((member, index) => {
      if (member.nationality && index === 0) {
        // Only for primary member
        const countryCodeMapping =
          NATIONALITY_TO_COUNTRY_CODE[
            member.nationality as keyof typeof NATIONALITY_TO_COUNTRY_CODE
          ];
        if (countryCodeMapping) {
          const currentCountryCode = form.getValues(
            `members.${index}.phoneCountryCode`
          );
          // Only update if it's different to avoid infinite loops
          if (currentCountryCode !== countryCodeMapping.code) {
            form.setValue(
              `members.${index}.phoneCountryCode`,
              countryCodeMapping.code
            );
            form.setValue(
              `members.${index}.phoneCountry`,
              countryCodeMapping.country
            );
          }
        }
      }

      // Trigger validation when nationality changes (for foreign passenger fields)
      if (member.nationality) {
        trigger(`members.${index}.fpassport`);
        trigger(`members.${index}.fexpdate`);
      }
    });
  }, [watchedMembers.map((m) => m.nationality).join(","), form, trigger]); // Watch nationality changes

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      console.log("Form submitted with data:", data);

      // Transform the form data to match CheckoutFormData structure
      const checkoutFormData: CheckoutFormData = {
        members: data.members.map((m, index) => ({
          id: `member-${index + 1}`,
          fullName: m.fullName,
          age: m.age,
          gender: m.gender,
          nationality: m.nationality,
          passportNumber: m.passportNumber,
          whatsappNumber: m.whatsappNumber,
          phoneCountryCode: m.phoneCountryCode, // NEW
          phoneCountry: m.phoneCountry, // NEW
          email: m.email,
          isPrimary: index === 0,
          selectedBookings: m.selectedBookings,
          // Foreign passenger fields for Makruzz
          fcountry: m.nationality !== "Indian" ? m.nationality : undefined,
          fpassport: m.fpassport,
          fexpdate: m.fexpdate,
        })),
        termsAccepted: data.termsAccepted,
      };

      // Update the store
      updateFormData(checkoutFormData);

      // Log the transformed data for debugging
      console.log("Transformed checkout form data:", checkoutFormData);
      console.log(
        "Member details for API:",
        checkoutFormData.members.map((m) => ({
          name: m.fullName,
          phone: m.whatsappNumber,
          phoneCountryCode: m.phoneCountryCode,
          phoneCountry: m.phoneCountry,
          nationality: m.nationality,
        }))
      );

      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Proceed to next step
      nextStep();
    } catch (error) {
      console.error("Form submission error:", error);
      setError(
        error instanceof Error ? error.message : "Form submission failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const addMember = () => {
    // Only add if we haven't reached the maximum required passengers
    if (fields.length < requirements.totalRequired) {
      append({
        fullName: "",
        age: "" as unknown as number,
        gender: "" as unknown as "Male",
        nationality: DEFAULT_VALUES.NATIONALITY,
        passportNumber: undefined,
        phoneCountryCode: DEFAULT_VALUES.PHONE_COUNTRY_CODE,
        phoneCountry: DEFAULT_VALUES.PHONE_COUNTRY,
        selectedBookings: [0],
        // Initialize foreign passenger fields
        fcountry: "",
        fpassport: "",
        fexpdate: "",
      });
    }
  };

  const removeMember = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className={styles.memberDetailsStep}>
      <div className={styles.header}>
        <SectionTitle
          text="Passenger Details"
          headingLevel="h1"
          specialWord="Passenger"
        />
        <p>
          Enter details for all passengers. The first passenger will be the
          primary contact.
        </p>
      </div>

      {/* Booking Requirements */}
      <div className={styles.bookingInfo}>
        <h3>Your Bookings</h3>
        <div className={styles.bookingsList}>
          {bookingData.items.map((item, index) => (
            <div key={item.id} className={styles.bookingItem}>
              <div className={styles.bookingIcon}>
                {item.type === "ferry" ? (
                  <Ship color="var(--color-primary)" size={24} />
                ) : (
                  <Target size={24} />
                )}
              </div>
              <div className={styles.bookingDetails}>
                <h4>{item.title}</h4>
                <p>
                  {item.passengers.adults} adults, {item.passengers.children}{" "}
                  children
                  {item.passengers.infants > 0 &&
                    `, ${item.passengers.infants} infants`}{" "}
                  • {item.date}
                </p>
              </div>
              <div className={styles.bookingPrice}>₹{item.price}</div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Member Forms */}
        <div className={styles.membersContainer}>
          {fields.map((field, index) => {
            const member = watchedMembers[index];
            const memberErrors = errors.members?.[index];
            const isPrimary = index === 0;

            return (
              <div key={field.id} className={styles.memberCard}>
                <div className={styles.memberHeader}>
                  <h4>
                    {isPrimary ? "Passenger 1 (Primary Contact)" : `Passenger ${index + 1}`}
                  </h4>
                  {!isPrimary && fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className={styles.memberFields}>
                  {/* Basic Information */}
                  <div className={styles.fieldRow}>
                    <Input
                      name={`members.${index}.fullName`}
                      control={control}
                      label="Full Name"
                      placeholder="Enter full name"
                      hasError={!!memberErrors?.fullName}
                      required
                    />

                    <Input
                      name={`members.${index}.age`}
                      control={control}
                      type="number"
                      label="Age"
                      placeholder="Enter age"
                      min={1}
                      max={120}
                      hasError={!!memberErrors?.age}
                      required
                    />
                  </div>

                  <div className={styles.fieldRow}>
                    <Controller
                      name={`members.${index}.gender`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Gender"
                          options={GENDER_OPTIONS}
                          hasError={!!memberErrors?.gender}
                          required
                          // errorMessage={memberErrors?.gender?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`members.${index}.nationality`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Nationality"
                          options={COUNTRIES}
                          hasError={!!memberErrors?.nationality}
                          required
                          // errorMessage={memberErrors?.nationality?.message}
                        />
                      )}
                    />
                  </div>

                  {/* Passport number field (only for foreign passengers) */}
                  {member?.nationality && member.nationality !== "Indian" && (
                    <div className={styles.fieldRow}>
                      {/* <h5 className={styles.foreignFieldsTitle}>
                        Foreign Passenger Details
                      </h5> */}
                      <Input
                        name={`members.${index}.fpassport`}
                        control={control}
                        label="Passport Number"
                        placeholder="Enter passport number"
                        hasError={!!memberErrors?.fpassport}
                        errorMessage={memberErrors?.fpassport?.message}
                        required
                      />

                      <Controller
                        name={`members.${index}.fexpdate`}
                        control={control}
                        render={({ field }) => (
                          // <div className={styles.inputGroup}>
                          //   <label className={styles.inputLabel}>
                          //     Passport Expiry Date
                          //   </label>
                          //   <DateSelect
                          //     selected={field.value}
                          //     onChange={field.onChange}
                          //     hasError={!!errors.selectedDate}
                          //   />
                          //   <input
                          //     {...field}
                          //     type="date"
                          //     className={`${styles.dateInput} ${
                          //       memberErrors?.fexpdate ? styles.inputError : ""
                          //     }`}
                          //     min={new Date().toISOString().split('T')[0]}
                          //     required
                          //   />
                          //   {memberErrors?.fexpdate && (
                          //     <span className={styles.errorMessage}>
                          //       {memberErrors.fexpdate.message}
                          //     </span>
                          //   )}
                          // </div>
                          <DateSelect
                            selected={
                              field.value ? new Date(field.value) : new Date()
                            }
                            onChange={(date) => {
                              // Convert Date to ISO string for form storage
                              const dateString = date
                                .toISOString()
                                .split("T")[0];
                              field.onChange(dateString);
                              // Trigger validation after date change
                              setTimeout(() => {
                                trigger(`members.${index}.fexpdate`);
                              }, 100);
                            }}
                            label="Passport Expiry Date"
                            hasError={!!memberErrors?.fexpdate}
                            errorMessage={memberErrors?.fexpdate?.message}
                            required
                            className={styles.dateSelectField}
                          />
                        )}
                      />
                    </div>
                  )}

                  {/* Contact fields for primary member */}
                  {isPrimary && (
                    <>
                      <PhoneInput
                        name={`members.${index}.whatsappNumber`}
                        control={control}
                        label="WhatsApp Number"
                        placeholder="Enter WhatsApp number"
                        hasError={!!memberErrors?.whatsappNumber}
                        required
                        defaultCountryCode={
                          watchedMembers[index]?.phoneCountryCode || "+91"
                        }
                        countryCode={watchedMembers[index]?.phoneCountryCode} // ✅ NEW: Pass current country code
                        onCountryChange={(countryCode, countryName) => {
                          // Update the form values when country changes
                          form.setValue(
                            `members.${index}.phoneCountryCode`,
                            countryCode
                          );
                          form.setValue(
                            `members.${index}.phoneCountry`,
                            countryName
                          );
                        }}
                      />

                      <Input
                        name={`members.${index}.email`}
                        control={control}
                        type="email"
                        label="Email Address"
                        placeholder="Enter email address"
                        hasError={!!memberErrors?.email}
                        required
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Member Button - Only show if we haven't reached the maximum */}
        {fields.length < requirements.totalRequired && (
          <div className={styles.addMemberSection}>
            <Button
              type="button"
              variant="outline"
              onClick={addMember}
              className={styles.addMemberButton}
            >
              Add Another Passenger ({fields.length}/
              {requirements.totalRequired})
            </Button>
          </div>
        )}

        {/* Show message when maximum passengers reached */}
        {fields.length >= requirements.totalRequired && (
          <div className={styles.maxPassengersMessage}>
            <p>Maximum passengers reached ({requirements.totalRequired})</p>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className={styles.termsSection}>
          <Controller
            name="termsAccepted"
            control={control}
            render={({ field: { value, onChange } }) => (
              <label className={styles.termsLabel}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  className={styles.termsCheckbox}
                />
                <span className={styles.termsText}>
                  I accept the{" "}
                  <a href="/terms" target="_blank" className={styles.termsLink}>
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    className={styles.termsLink}
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
            )}
          />
          {errors.termsAccepted && (
            <div className={styles.termsError}>
              {errors.termsAccepted.message}
            </div>
          )}
        </div>

        {/* Debug info for development */}
        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              padding: "1rem",
              background: "#f0f0f0",
              margin: "1rem 0",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
            }}
          >
            <strong>Debug Info:</strong>
            <div>Form Valid: {isValid ? "Yes" : "No"}</div>
            <div>Errors: {JSON.stringify(errors, null, 2)}</div>
          </div>
        )}

        {/* Submit Button */}
        <div className={styles.submitSection}>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={!isValid}
            className={styles.submitButton}
          >
            Review Booking
          </Button>
        </div>
      </form>
    </div>
  );
};
