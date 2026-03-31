import React from "react";
import Image from "next/image";
import styles from "./Testimonials.module.css"; // Reuse existing styles
import googleIcon from "@public/icons/socials/google.svg";
import { SectionTitle, DecorativeCurlyArrow } from "@/components/atoms";
import { Column, Container, Section } from "@/components/layout";
import { TestimonialCard } from "@/components/molecules/Cards";

// Text truncation utility
const truncateText = (text: string, maxLength: number = 300): string => {
  if (text.length <= maxLength) return text;

  // Find the last complete sentence or word before the limit
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastSpace = truncated.lastIndexOf(" ");

  // If we find a complete sentence, use that
  if (lastPeriod > maxLength * 0.7) {
    return truncated.substring(0, lastPeriod + 1);
  }

  // Otherwise, truncate at the last word
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + "...";
  }

  // Fallback: hard truncate with ellipsis
  return truncated + "...";
};

// Hardcoded Google Reviews data
const GOOGLE_REVIEWS_DATA = {
  title: "Our Client Appreciations Keeps Us Going",
  subtitle: "Rated 4.9/5 based on 350+ authentic Google Reviews",
  specialWord: "Client Appreciations",
  testimonials: [
    {
      id: "review_1",
      text: "We had an amazing experience with this team! They were highly professional and arranged everything seamlessly. They planned the itinerary exactly as per our requirements, ensuring a smooth and enjoyable trip. The hotels and cabs they arranged were excellent, adding to our comfort. Their coordination was top-notch, with everything planned in advance, and they were always available whenever we needed assistance. Our stay in Andaman was truly unforgettable, and we were able to make the most of it without any hassle. A special thanks to Jackie for making it all possible! Highly recommended!.",
      author: "Mohit Kumar",
      avatar: {
        url: "/images/profile_pictures/mohit_kumar.png",
        alt: "Mohit Kumar's profile picture",
      },
      rotation: 6,
    },
    {
      id: "review_2",
      text: "Our tour package is arranged by Andaman Excursion and his planning and coordination is too good. Every time the cab was on time and his response also very nice. They treated us a family. Anytime any queries we called means he respond and solve those things too fast. We stayed in GKB Home Stay. The rooms are neat and clean and there also a sea view rooms .Food also too good in GKB Home Stay.",
      author: "Gunalathi Rajkannan",
      avatar: {
        url: "/images/profile_pictures/gunalathi_rajkannan.png",
        alt: "Gunalathi Rajkannan's profile picture",
      },
      rotation: -3,
    },
    {
      id: "review_3",
      text: "It was a wonderfully memorable family vacation midst of the beautiful islands. The itinerary planner had taken care of minutest details and the execution was flawless too. The team was there for it all to help & resolve any issues which may have come up in Port Blair, Havelock & Neil. The selection of stays too was kept very personal and comfort was the prime factor whilst deciding on them. The schedule was power packed but it kept room for rest & recuperation too. Mr Ganesh, our tour chief coordinator, needs a special mention for his excellent managerial skills. Thanks & All the best for many such Happy Memories…",
      author: "Kapil Verma",
      avatar: {
        url: "/images/profile_pictures/kapil_verma.png",
        alt: "Kapil Verma's profile picture",
      },
      rotation: 3,
    },
    {
      id: "review_4",
      text: "I had an amazing experience with Andaman Excursion Pvt Ltd during my 5-day package in Andaman. Everything was well-organized — beautiful resorts for stay to good food and smooth transport. The prompt pickup,the delicious fresh sea food cooked to perfection,the picturesque beaches and resorts etc does make this trip unforgettable.Special thanks to Mr. Ganesh for personally ensuring everything went perfectly and showing this hidden gem.",
      author: "P. B. Akhil",
      avatar: {
        url: "/images/profile_pictures/pb_akhil.png",
        alt: "P. B. Akhil's profile picture",
      },
      rotation: -4,
    },
    {
      id: "review_5",
      text: "At the first point we were not sure how the trip is gonna turn around but at the end of our trip we felt like this is the trip that we all needed to refresh our minds and we also realised that we have spent some quality time together as a group of people . Well thanks for making this happen Andaman Excursion Pvt ltd , and those who are planning to Andhaman please do book Andhaman Excursion and do get your best Experience, our trip was affordable and enjoyable by the end of our trip and food they provided for us on all the day were good and considered our choices for the food .",
      author: "Pranav Arjun",
      avatar: {
        url: "/images/profile_pictures/pranav_arjun.png",
        alt: "Pranav Arjun's profile picture",
      },
      rotation: 3,
    },
    {
      id: "review_6",
      text: "We had 5 night's stay in Andaman which was completely a stunning experience to visit different places through Ferry and boat. It's completely a different experience exploring all Islands. Food was fabulous and stay was affordable at different Islands and was very good at nominal prices.",
      author: "Vimala R",
      avatar: {
        url: "/images/profile_pictures/vimala_r.png",
        alt: "Vimala R's profile picture",
      },
      rotation: -6,
    },
    {
      id: "review_7",
      text: "This place and our trip was really worth it. Natural beauty all around with awesome vibes. The memories of this trip will always remain in our soul. I will highly recommend Andamans based on my experience. Special thanks to Andaman Excursion Pvt Ltd and Jakey bhai for make it happen so smoothly",
      author: "Ravi Kaushik",
      avatar: {
        url: "/images/profile_pictures/ravi_kaushik.png", // MISSING: ravi_kaushik.png
        alt: "Ravi Kaushik's profile picture",
      },
      rotation: 5,
    },
    {
      id: "review_8",
      text: "It was a wonderful and memorable trip for me and my family. From pick up till drop to Airport everything was on time. All the team members were very helpful and soft spoken. All the given accommodation was amazing and especially the food was very delicious. I would like to thanks all the team members for making this trip unforgettable for us.",
      author: "Sanjay Thapa",
      avatar: {
        url: "/images/profile_pictures/sanjay_thapa.png",
        alt: "Sanjay Thapa's profile picture",
      },
      rotation: 2,
    },
    {
      id: "review_9",
      text: "Two weeks back I visited Andaman with my friends.It was a wonderful experience and a trustworthy travel operator.The arrangements they provided were very satisfactory.really appreciate the timely food provided.It was fun and we enjoyed a lot.",
      author: "Nandhini BhavaniShankar",
      avatar: {
        url: "/images/profile_pictures/nandhini_bhavaniShankar.png",
        alt: "Nandhini BhavaniShankar's profile picture",
      },
      rotation: -3,
    },
    {
      id: "review_10",
      text: "The itinerary was perfectly balanced with adventure and relaxation, covering highlights like Havelock Island, Neil Island (especially the beautiful Coral Beach), Baratang, and scuba diving at Havelock. Our guides were friendly, knowledgeable, and always eager to help. A special thanks to our trip coordinator, Jackie Bhaiya and Ganesh Bhaiya who ensured everything ran smoothly and made us feel well taken care of throughout the journey.",
      author: "Aman Agarwal",
      avatar: {
        url: "/images/profile_pictures/aman_agrawal.png",
        alt: "Aman Agarwal's profile picture",
      },
      rotation: 4,
    },
  ],
};

interface GoogleTestimonialsProps {
  className?: string;
  customTitle?: string;
  customSubtitle?: string;
  enabled?: boolean;
}

export const GoogleTestimonials: React.FC<GoogleTestimonialsProps> = ({
  className,
  customTitle,
  customSubtitle,
  enabled = true,
}) => {
  if (!enabled) return null;

  const {
    title: defaultTitle,
    subtitle: defaultSubtitle,
    testimonials,
    specialWord,
  } = GOOGLE_REVIEWS_DATA;

  const title = customTitle || defaultTitle;
  const subtitle = customSubtitle || defaultSubtitle;

  // Create a duplicate set of testimonials for the infinite scroll effect
  const duplicatedTestimonials = [...testimonials, ...testimonials].map(
    (testimonial) => ({
      ...testimonial,
      text: truncateText(testimonial.text, 300), // Apply truncation
    })
  );

  return (
    <Section
      className={`${styles.testimonialsSection} ${className || ""}`}
      fullBleed
      id="google-testimonials"
      aria-labelledby="google-testimonials-title"
    >
      <Column gap={6} fullWidth className={styles.testimonialsContainer}>
        <Container className={styles.testimonialsHeaderContainer}>
          <Column gap={2}>
            <SectionTitle
              text={title}
              specialWord={specialWord}
              id="google-testimonials-title"
            />
            <DecorativeCurlyArrow
              top="10%"
              left="45%"
              scale={2}
              rotation={30}
            />
            <div className={styles.googleInfo}>
              <div className={styles.googleIcon}>
                <Image
                  src={googleIcon}
                  aria-label="Google"
                  alt="Google"
                  width={20}
                  height={20}
                />
              </div>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
          </Column>
        </Container>
        <div
          className={styles.carouselContainer}
          aria-label="Customer testimonials carousel"
        >
          <div className={styles.carousel}>
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialCard
                key={`${testimonial.id}-${index}`}
                text={testimonial.text}
                author={testimonial.author}
                avatar={testimonial.avatar}
                rotation={testimonial.rotation}
              />
            ))}
          </div>
        </div>
      </Column>
    </Section>
  );
};
