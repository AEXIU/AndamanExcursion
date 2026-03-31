"use client";

import React, { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import styles from "./TagInput.module.css";
import type { TagInputProps } from "./TagInput.types";

export const TagInput: React.FC<TagInputProps> = ({
  tags = [],
  defaultTags = [],
  onChange,
  className = "",
  placeholder = "Add a tag...",
  maxTags = 10,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      const newTags = [...tags, trimmedTag];
      onChange(newTags);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    onChange(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleDefaultTagClick = (tag: string) => {
    addTag(tag);
  };

  return (
    <div className={`${styles.tagInputWrapper} ${className}`}>
      <div className={styles.tagContainer}>
        {tags.map((tag, index) => (
          <div key={`${tag}-${index}`} className={styles.tag}>
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className={styles.removeTag}
              aria-label={`Remove tag ${tag}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className={styles.tagInput}
          aria-label="Add a tag"
        />
      </div>

      {defaultTags.length > 0 && tags.length < maxTags && (
        <div className={styles.defaultTagsContainer}>
          {defaultTags
            .filter((tag) => !tags.includes(tag))
            .map((tag, index) => (
              <button
                key={`default-${tag}-${index}`}
                type="button"
                onClick={() => handleDefaultTagClick(tag)}
                className={styles.defaultTag}
              >
                <Plus size={14} className={styles.plusIcon} />
                <span>{tag}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
