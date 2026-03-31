import { ExperienceSection } from "@/components/molecules/ExperienceSection/ExperienceSection";
import { VisualCategoryGrid } from "@/components/sectionBlocks/common";
import {
  FAQ,
  Testimonials,
  Partners,
  LargeCardSection,
  SecondaryBanner,
  Trivia,
  ServiceTeaser,
  TopActivityCategories,
  RichTextBlock,
} from "@/components/sectionBlocks/common";
import { PlanInFourEasySteps } from "@/components/sectionBlocks/ferry/planInfourEasySteps/PlanInFourEasySteps";
import { TrustedFerriesBlock } from "@/components/sectionBlocks/ferry";
import { DynamicPackagesBlock } from "@/components/sectionBlocks/packages/DynamicPackagesBlock/DynamicPackagesBlock";

import {
  Banner,
  HiddenGems,
  PackageCarousel,
  Packages,
  Story,
  TopAdventures,
  TrustStats,
  WhyChooseUs,
  PnrLookup,
} from "@/components/sectionBlocks/homepage";
import { Page } from "@payload-types";
import { FeatureSection } from "@/components/molecules/FeatureSection/FeatureSection";
import { DynamicCategoryPackagesBlock } from "@/components/sectionBlocks/packages/DynamicCategoryPackagesBlock/DynamicCategoryPackagesBlock";
import { GoogleTestimonials } from "@/components/sectionBlocks/common/googleTestimonials/GoogleTestimonials";
import TeamSection from "@/components/molecules/TeamSection/TeamSection";
import { ThingsToDo } from "@/components/sectionBlocks/boat/thingsToDo/ThingsToDo";
import { TripRoute } from "@/components/sectionBlocks/boat/tripRoute/TripRoute";
import { JourneySection } from "@/components/molecules/JourneySection/JourneySection";

const blockComponentsMap = {
  richText: RichTextBlock,
  hero: Banner,
  secondaryBanner: SecondaryBanner,
  hiddenGems: HiddenGems,
  packageCarousel: PackageCarousel,
  trustStats: TrustStats,
  whyChooseUs: WhyChooseUs,
  faq: FAQ,
  largeCard: LargeCardSection,
  partners: Partners,
  story: Story,
  topActivityCategories: TopActivityCategories,
  topAdventures: TopAdventures,
  testimonials: Testimonials,
  googleTestimonials: GoogleTestimonials,
  serviceFeature: FeatureSection,
  serviceTeaser: ServiceTeaser,
  trivia: Trivia,
  experience: ExperienceSection,
  howToReach: null,
  visualCategoryGrid: VisualCategoryGrid,
  planInFourEasySteps: PlanInFourEasySteps,
  trustedFerries: TrustedFerriesBlock,
  dynamicPackages: DynamicPackagesBlock,
  dynamicCategoryPackages: DynamicCategoryPackagesBlock,
  teamSection: TeamSection,
  pnrLookup: PnrLookup,
  thingsToDo: ThingsToDo,
  tripRoute: TripRoute,
  journeySection: JourneySection,
} as const;

interface BlockRendererProps {
  blocks: NonNullable<Page["pageContent"]>["content"];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <>
      {blocks.map((block, index) => {
        const Component =
          blockComponentsMap[
          block.blockType as keyof typeof blockComponentsMap
          ];

        if (!Component) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `No component found for block type: ${block.blockType}`
            );
          }
          return null;
        }

        const { id, blockType, blockName, ...content } = block;

        return (
          <Component
            key={id || `${blockType}-${index}`}
            id={id || undefined}
            content={content as any}
          />
        );
      })}
    </>
  );
}
