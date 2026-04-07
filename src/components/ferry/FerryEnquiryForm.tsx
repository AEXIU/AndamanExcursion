"use client";

import React, { useEffect } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, UserPlus } from "lucide-react";

import { Input } from "@/components/atoms/Input/Input";
import { Select } from "@/components/atoms/Select/Select";
import { PhoneInput } from "@/components/atoms/PhoneInput/PhoneInput";
import {
  COUNTRIES,
  GENDER_OPTIONS,
  DEFAULT_VALUES,
  NATIONALITY_TO_COUNTRY_CODE,
} from "@/constants";

import { UnifiedFerryResult, FerryClass } from "@/types/FerryBookingSession.types";
import styles from "./FerryEnquiryForm.module.css";

// 1. Zod Schema
const passengerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(1, "Valid age is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  nationality: z.string().min(1, "Please select nationality"),
  passportNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
  phoneCountryCode: z.string().optional(),
  phoneCountry: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional(),
});

const enquirySchema = z.object({
  passengers: z.array(passengerSchema).min(1),
  classId: z.string().min(1, "Please select a class"),
});

export type EnquiryFormData = z.infer<typeof enquirySchema>;

interface FerryEnquiryFormProps {
  formId: string;
  ferry: UnifiedFerryResult;
  selectedClass: FerryClass | null;
  onClassSelect: (classData: FerryClass) => void;
  numberOfPassengers: number;
  onSubmitEnquiry: (data: EnquiryFormData) => void;
}

export const FerryEnquiryForm: React.FC<FerryEnquiryFormProps> = ({
  formId,
  ferry,
  selectedClass,
  onClassSelect,
  numberOfPassengers,
  onSubmitEnquiry,
}) => {
  // Setup React Hook Form
  const form = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      classId: selectedClass?.id || "",
      passengers: Array.from({ length: Math.max(1, Number(numberOfPassengers) || 1) }, (_, i) => ({
        fullName: "",
        age: "" as unknown as number,
        gender: "" as unknown as "Male",
        nationality: "Indian",
        passportNumber: "",
        whatsappNumber: i === 0 ? "" : undefined,
        phoneCountryCode: i === 0 ? "+91" : undefined,
        phoneCountry: i === 0 ? "India" : undefined,
        email: i === 0 ? "" : undefined,
      })),
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const { fields, append } = useFieldArray({
    control,
    name: "passengers",
  });

  // Keep form's classId in sync if selectedClass changes externally
  useEffect(() => {
    if (selectedClass?.id) {
      setValue("classId", selectedClass.id);
    }
  }, [selectedClass, setValue]);

  // Watch nationality to conditionally require passport and update phone country code
  const watchedPassengers = watch("passengers");

  useEffect(() => {
    (watchedPassengers || []).forEach((p: EnquiryFormData["passengers"][0], index: number) => {
      // Auto-update country code for primary contact
      if (index === 0 && p.nationality) {
        const countryMapping =
          NATIONALITY_TO_COUNTRY_CODE[
            p.nationality as keyof typeof NATIONALITY_TO_COUNTRY_CODE
          ];
        if (countryMapping && p.phoneCountryCode !== countryMapping.code) {
          setValue(`passengers.${index}.phoneCountryCode`, countryMapping.code);
          setValue(`passengers.${index}.phoneCountry`, countryMapping.country);
        }
      }
    });
  }, [watchedPassengers, setValue]);

  // Handle local change of Class dropdown
  // Note: Radix Select's onValueChange passes a string, not a DOM event
  const handleClassChange = (classId: string) => {
    setValue("classId", classId);
    
    // Find the actual class object to notify the parent
    const classData = ferry?.classes?.find((c: FerryClass) => c.id === classId);
    if (classData) onClassSelect(classData);
  };

  const classOptions = [
    { value: "", label: "Select Class" },
    ...(ferry?.classes || []).map((c: FerryClass) => ({
      value: c.id,
      label: c.name,
    })),
  ];

  return (
    <form
      id={formId}
      className={styles.formContainer}
      onSubmit={handleSubmit(onSubmitEnquiry)}
    >
      <div className={styles.alertBanner}>
        <AlertCircle size={16} />
        <span>Ticket will be booked offline through Andaman Excursion</span>
      </div>

      {/* Ferry Details Block */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3>Ferry Details</h3>
        </div>
        <div className={styles.row}>
          <div className={styles.ferryNameField}>
            <label className={styles.ferryNameLabel}>
              Ferry
            </label>
            <input
              type="text"
              value={ferry?.ferryName || ""}
              disabled
              className={styles.ferryNameInput}
            />
          </div>
          <Controller
            name="classId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Select Class*"
                options={classOptions}
                onChange={handleClassChange}
                hasError={!!errors.classId}
              />
            )}
          />
        </div>
      </div>

      {/* Passengers Array */}
      {fields.map((field: Record<string, any>, index: number) => {
        const isPrimary = index === 0;
        const passengerErrors = errors.passengers?.[index];
        const isForeigner = (watchedPassengers || [])[index]?.nationality !== "Indian";

        return (
          <div key={field.id} className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3>
                {isPrimary ? "Adult 1" : `Adult ${index + 1}`}
              </h3>
            </div>

            <div className={styles.fieldGroup}>
              <h4 className={styles.subHeading}>Basic Details</h4>
              <div className={styles.row}>
                <Input
                  label="Full Name as per ID*"
                  placeholder="Enter full name"
                  name={`passengers.${index}.fullName`}
                  control={control}
                  hasError={!!passengerErrors?.fullName}
                />
                <Input
                  label="Enter Age*"
                  type="number"
                  placeholder="28"
                  name={`passengers.${index}.age`}
                  control={control}
                  hasError={!!passengerErrors?.age}
                />
                <Controller
                  name={`passengers.${index}.gender`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Gender*"
                      options={GENDER_OPTIONS}
                      hasError={!!passengerErrors?.gender}
                    />
                  )}
                />
              </div>

              <div className={styles.row}>
                <Controller
                  name={`passengers.${index}.nationality`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Nationality*"
                      options={COUNTRIES}
                      hasError={!!passengerErrors?.nationality}
                    />
                  )}
                />
                <Input
                  label={`Passport Number${isForeigner ? "*" : ""}`}
                  placeholder="A2345678"
                  name={`passengers.${index}.passportNumber`}
                  control={control}
                  hasError={!!passengerErrors?.passportNumber}
                  required={isForeigner}
                />
              </div>
            </div>

            {isPrimary && (
              <div className={styles.fieldGroup} style={{ marginTop: "1rem" }}>
                <h4 className={styles.subHeading}>Contact Details</h4>
                <div className={styles.row}>
                  <PhoneInput
                    name={`passengers.${index}.whatsappNumber`}
                    control={control}
                    label="Whatsapp Number*"
                    placeholder="Enter WhatsApp number"
                    hasError={!!passengerErrors?.whatsappNumber}
                    required
                    defaultCountryCode={
                      (watchedPassengers || [])[index]?.phoneCountryCode || "+91"
                    }
                    countryCode={(watchedPassengers || [])[index]?.phoneCountryCode}
                    onCountryChange={(countryCode, countryName) => {
                      setValue(
                        `passengers.${index}.phoneCountryCode`,
                        countryCode
                      );
                      setValue(
                        `passengers.${index}.phoneCountry`,
                        countryName
                      );
                    }}
                  />
                  <Input
                    label="Email ID*"
                    type="email"
                    placeholder="example@gmail.com"
                    name={`passengers.${index}.email`}
                    control={control}
                    hasError={!!passengerErrors?.email}
                  />
                </div>
                <div className={styles.contactHint}>
                  <AlertCircle size={12} />
                  <span>Ticket will be sent via WhatsApp</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Passenger Button */}
      <button
        type="button"
        className={styles.addPassengerBtn}
        onClick={() =>
          append({
            fullName: "",
            age: 0,
            gender: "Male" as const,
            nationality: DEFAULT_VALUES.NATIONALITY,
            passportNumber: "",
            whatsappNumber: "",
            phoneCountryCode: DEFAULT_VALUES.PHONE_COUNTRY_CODE,
            phoneCountry: DEFAULT_VALUES.PHONE_COUNTRY,
            email: "",
          })
        }
      >
        <UserPlus size={18} />
        <span>Add Another Passenger</span>
      </button>
    </form>
  );
};
