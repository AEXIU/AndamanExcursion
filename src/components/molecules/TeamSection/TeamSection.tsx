import { Section } from "@/components/layout";
import React from "react";
import { SmallCard } from "../Cards";
import { SectionTitle } from "@/components/atoms";
import { Media } from "@payload-types";
import styles from "./TeamSection.module.css";

interface TeamMember {
  image: Media;
  title: string;
  designation: string;
  id?: string;
}

interface TeamSectionContent {
  teamMembers: TeamMember[];
}

interface TeamSectionProps {
  content: TeamSectionContent;
}

function TeamSection({ content }: TeamSectionProps) {
  return (
    <Section
      id="team-section"
      aria-labelledby="team-section-title"
      className={styles.teamSection}
    >
      <div className={styles.teamContainer}>
        <div className={styles.teamHeader}>
          <SectionTitle
            specialWord="Team"
            text="Our Team"
            id="team-section-title"
          />
        </div>

        <div className={styles.teamGrid}>
          {content.teamMembers.map((member, index) => (
            <SmallCard
              key={member.id || `team-member-${index}`}
              image={member.image}
              imageAlt={`${member.title} - ${member.designation}`}
              title={member.title}
              description={member.designation}
              variant="member"
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

export default TeamSection;
