import React from "react";

import styles from "./NoteItem.module.css";

interface NoteItemProps {
  text: string;
}

export const NoteItem: React.FC<NoteItemProps> = ({ text }) => {
  return (
    <div className={styles.noteItem}>
      <p className={styles.noteItemText}>{text}</p>
    </div>
  );
};
