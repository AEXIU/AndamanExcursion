import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ContactFormData } from "../ContactForm/ContactForm.types";
import styles from "./AdditionalMessage.module.css";
import { Textarea, TagInput } from "@/components/atoms";
import { cn } from "@/utils/cn";

interface AdditionalMessageProps {
  form: UseFormReturn<ContactFormData>;
}

export const AdditionalMessage: React.FC<AdditionalMessageProps> = ({
  form,
}) => {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const tags = watch("additional.tags") || [];

  // Common additional requests that travelers might have
  const defaultTags = [
    "Need a 3N/4D Package",
    "Changed Dates",
    "Free Breakfast and High Tea",
    "Airport Transfer",
    "Early Check-in",
    "Late Check-out",
    "Room Upgrade Request",
  ];

  const handleTagsChange = (newTags: string[]) => {
    setValue("additional.tags", newTags, { shouldValidate: true });

    // Update the message with the selected tags
    const message = newTags.join(". ");
    setValue("additional.message", message, { shouldValidate: true });
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Any Additional Message?</h2>
      <div className={styles.grid}>
        <div className={cn(styles.gridItem, styles.tagsContainer)}>
          <div className={styles.tagsLabel}>
            Select from common requests or add your own:
          </div>
          <TagInput
            tags={tags}
            defaultTags={defaultTags}
            onChange={handleTagsChange}
            placeholder="Type to add custom request..."
          />
        </div>

        <div className={cn(styles.gridItem, styles.messageContainer)}>
          <div className={styles.messageLabel}>Your message:</div>
          <Textarea
            name="additional.message"
            control={control}
            placeholder="Your message will be automatically updated based on selected requests above. You can also type directly here."
            rows={5}
            hasError={!!errors.additional?.message}
          />
        </div>
      </div>
    </section>
  );
};
