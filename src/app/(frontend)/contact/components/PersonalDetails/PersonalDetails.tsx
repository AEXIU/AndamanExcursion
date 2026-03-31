// PersonalDetails.tsx
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ContactFormData } from "../ContactForm/ContactForm.types";
import { cn } from "@/utils/cn";
import styles from "./PersonalDetails.module.css";
import { Input, PhoneInput } from "@/components/atoms";

interface PersonalDetailsProps {
  form: UseFormReturn<ContactFormData>;
}

export const PersonalDetails: React.FC<PersonalDetailsProps> = ({ form }) => {
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Your Details</h2>
      <div className={styles.grid}>
        <div className={styles.row}>
          {/* Full Name Field */}
          <div className={cn(styles.gridItem, styles.fullNameInput)}>
            <Input
              name="personal.fullName"
              control={control}
              label="Full Name"
              placeholder="Enter your full name"
              required
              hasError={!!errors.personal?.fullName}
            />
          </div>
          {/* Age Field */}
          <div className={cn(styles.gridItem, styles.ageInput)}>
            <Input
              name="personal.age"
              control={control}
              label="Age"
              type="number"
              min={1}
              max={120}
              placeholder="Your age"
              required
              hasError={!!errors.personal?.age}
            />
          </div>
        </div>
        <div className={styles.row}>
          {/* Phone Field */}
          <div className={cn(styles.gridItem, styles.phoneInput)}>
            <PhoneInput
              name="personal.phone"
              control={control}
              label="Contact Number"
              placeholder="Enter your phone number"
              required
              hasError={!!errors.personal?.phone}
            />
          </div>
          {/* Email Field */}
          <div className={cn(styles.gridItem, styles.emailInput)}>
            <Input
              name="personal.email"
              control={control}
              label="Email ID"
              type="email"
              placeholder="Enter your email address"
              required
              hasError={!!errors.personal?.email}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
