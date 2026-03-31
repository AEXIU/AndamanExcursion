import { RichText } from "@payloadcms/richtext-lexical/react";
import { Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import styles from "./RichTextBlock.module.css";

interface RichTextBlockProps {
  id?: string;
  content: {
    title?: string | null;
    content: any;
  };
}

export const RichTextBlock = ({ id, content }: RichTextBlockProps) => {
  if (!content?.content) return null;

  return (
    <Section id={id} className={styles.section}>
      {content.title && (
        <SectionTitle text={content.title} headingLevel="h1" specialWord={content.title} />
      )}
      <div className={styles.content}>
        <RichText data={content.content} />
      </div>
    </Section>
  );
};
