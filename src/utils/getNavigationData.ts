import { NavigationItem } from "@/components/molecules/DesktopNav/DesktopNav.types";
import { navigationService } from "@/services/payload/collections/navigation";
import { cache } from "react";

// Define types for category objects
interface ActivityCategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

interface PackageCategory {
  id: string;
  title: string;
  slug: string;
  isActive?: boolean;
  displaySettings?: {
    order: number;
    isActive: boolean;
  };
}

interface SpecialCategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
}

interface CustomItem {
  label: string;
  href: string;
  isActive: boolean;
}

interface DestinationSubcategory {
  name: string;
  slug: string;
  isActive: boolean;
}

interface DestinationMainCategory {
  mainCategory: string;
  mainCategorySlug: string;
  subcategories: DestinationSubcategory[];
  isActive: boolean;
  order: number;
}

// Cache the navigation data for the duration of the request
export const getNavigationData = cache(async (): Promise<NavigationItem[]> => {
  try {
    // Fetch navigation configuration from Payload CMS
    const navigationConfig = await navigationService.getMainNavigation();

    if (!navigationConfig?.mainNavigation) {
      return getFallbackNavigation();
    }

    // Transform Payload data to our NavigationItem format
    const transformedItems = await Promise.all(
      navigationConfig.mainNavigation
        .filter((item: any) => item.displaySettings?.isActive)
        .sort(
          (a: any, b: any) =>
            (a.displaySettings?.order || 0) - (b.displaySettings?.order || 0)
        )
        .map(async (item: any) => {
          const baseItem: NavigationItem = {
            label: item.label === "Destinations" ? "Experiences" : item.label,
            href: item.href,
            unique: item.unique || false,
            isClickable: item.isClickable !== false, // Default to true if not explicitly false
          };

          // Handle different dropdown types
          switch (item.type) {
            case "activities":
              if (item.activityCategories?.length) {
                baseItem.children = item.activityCategories
                  .filter((category: ActivityCategory) => category.isActive)
                  .sort(
                    (a: ActivityCategory, b: ActivityCategory) =>
                      a.sortOrder - b.sortOrder
                  )
                  .slice(0, item.displaySettings?.maxDropdownItems || 10)
                  .map((category: ActivityCategory) => ({
                    label: category.name,
                    href: `/activities/search?activityType=${category.slug}`,
                  }));
              }
              break;

            case "packages":
              if (item.packageCategories?.length) {
                baseItem.children = item.packageCategories
                  // For packages, don't check isActive directly as it may not exist at top level
                  .filter(
                    (category: PackageCategory) =>
                      category.displaySettings?.isActive !== false
                  )
                  .sort(
                    (a: PackageCategory, b: PackageCategory) =>
                      (a.displaySettings?.order || 0) -
                      (b.displaySettings?.order || 0)
                  )
                  .slice(0, item.displaySettings?.maxDropdownItems || 10)
                  .map((category: PackageCategory) => ({
                    label: category.title,
                    href: `/packages/${category.slug}`,
                  }));
              }
              break;

            case "specials":
              if (item.specialCategories?.length) {
                baseItem.children = item.specialCategories
                  .filter((category: SpecialCategory) => category.isActive)
                  .sort(
                    (a: SpecialCategory, b: SpecialCategory) =>
                      (a.order || 0) - (b.order || 0)
                  )
                  .slice(0, item.displaySettings?.maxDropdownItems || 10)
                  .map((category: SpecialCategory) => ({
                    label: category.name,
                    href: `/specials/${category.slug}`,
                  }));
              }
              break;

            case "destinations":
              // Explicitly override the main label for the destinations dropdown
              baseItem.label = "Experiences";
              
              // Auto-populate destinations from page data (primary method)
              try {
                const { pageService } = await import(
                  "@/services/payload/collections/pages"
                );
                const destinationsData =
                  await pageService.getDestinationsForNavigation();

                const nestedChildren: NavigationItem[] = [];

                // Use manual configuration as override/supplement if provided
                if (item.destinationConfig?.length) {
                  // Manual configuration takes precedence - merge with page data
                  const manualConfig = new Map();
                  item.destinationConfig
                    .filter(
                      (mainCat: DestinationMainCategory) => mainCat.isActive
                    )
                    .forEach((mainCat: DestinationMainCategory) => {
                      manualConfig.set(mainCat.mainCategorySlug, mainCat);
                    });

                  // Custom sort order for manual configurations
                  const customOrder = [
                    "Port Blair",
                    "Havelock",
                    "Neil Island",
                    // "Baratang",
                    "Long Island",
                    "Rangat",
                    "Diglipur",
                  ];
                  item.destinationConfig
                    .filter(
                      (mainCat: DestinationMainCategory) => mainCat.isActive
                    )
                    .sort(
                      (
                        a: DestinationMainCategory,
                        b: DestinationMainCategory
                      ) => {
                        const aIndex = customOrder.indexOf(a.mainCategory);
                        const bIndex = customOrder.indexOf(b.mainCategory);

                        // If both are in custom order, sort by that order
                        if (aIndex !== -1 && bIndex !== -1) {
                          return aIndex - bIndex;
                        }
                        // If only one is in custom order, prioritize it
                        if (aIndex !== -1) return -1;
                        if (bIndex !== -1) return 1;
                        // If neither is in custom order, sort alphabetically
                        return a.mainCategory.localeCompare(b.mainCategory);
                      }
                    )
                    .forEach((mainCat: DestinationMainCategory) => {
                      const mainCategoryItem: NavigationItem = {
                        label: mainCat.mainCategory,
                        href: `/destinations/${mainCat.mainCategorySlug}`,
                        isMainCategory: true,
                        categoryType: "destinations",
                        isClickable: true,
                      };

                      if (mainCat.subcategories?.length) {
                        // Sort subcategories alphabetically by name
                        mainCategoryItem.children = mainCat.subcategories
                          .filter(
                            (subCat: DestinationSubcategory) => subCat.isActive
                          )
                          .sort(
                            (
                              a: DestinationSubcategory,
                              b: DestinationSubcategory
                            ) => a.name.localeCompare(b.name)
                          )
                          .map((subCat: DestinationSubcategory) => ({
                            label: subCat.name,
                            href: `/destinations/${mainCat.mainCategorySlug}/${subCat.slug}`,
                            isSubCategory: true,
                            categoryType: "destinations",
                          }));
                      }

                      nestedChildren.push(mainCategoryItem);
                    });
                } else if (destinationsData.main.length > 0) {
                  // Auto-populate from page data when no manual config
                  const subsByMain = new Map();

                  destinationsData.sub.forEach((subDest: any) => {
                    const parentId =
                      typeof subDest.destinationInfo?.parentMainCategory ===
                      "string"
                        ? subDest.destinationInfo.parentMainCategory
                        : subDest.destinationInfo?.parentMainCategory?.id;

                    if (!subsByMain.has(parentId)) {
                      subsByMain.set(parentId, []);
                    }
                    subsByMain.get(parentId).push(subDest);
                  });

                  // Custom sort order for main destinations
                  const customOrder = [
                    "Port Blair",
                    "Havelock",
                    "Neil Island",
                    // "Baratang",
                    "Long Island",
                    "Rangat",
                    "Diglipur",
                  ];
                  destinationsData.main
                    .sort((a: any, b: any) => {
                      const aIndex = customOrder.indexOf(a.title);
                      const bIndex = customOrder.indexOf(b.title);

                      // If both are in custom order, sort by that order
                      if (aIndex !== -1 && bIndex !== -1) {
                        return aIndex - bIndex;
                      }
                      // If only one is in custom order, prioritize it
                      if (aIndex !== -1) return -1;
                      if (bIndex !== -1) return 1;
                      // If neither is in custom order, sort alphabetically
                      return a.title.localeCompare(b.title);
                    })
                    .slice(0, item.displaySettings?.maxDropdownItems || 10)
                    .forEach((mainDest: any) => {
                      const mainCategoryItem: NavigationItem = {
                        label: mainDest.title,
                        href: `/destinations/${mainDest.destinationInfo?.mainCategorySlug}`,
                        isMainCategory: true,
                        categoryType: "destinations",
                        isClickable: true,
                      };

                      // Add subcategories
                      const subs = subsByMain.get(mainDest.id) || [];

                      if (subs.length > 0) {
                        // Show all subcategories - no limit
                        // Sort subcategories alphabetically by title
                        mainCategoryItem.children = subs
                          .sort((a: any, b: any) =>
                            a.title.localeCompare(b.title)
                          )
                          .map((subDest: any) => ({
                            label: subDest.title,
                            href: `/destinations/${mainDest.destinationInfo?.mainCategorySlug}/${subDest.destinationInfo?.subcategorySlug}`,
                            isSubCategory: true,
                            categoryType: "destinations",
                          }));
                      }

                      nestedChildren.push(mainCategoryItem);
                    });
                }

                baseItem.children = nestedChildren;
                baseItem.categoryType = "destinations";
              } catch (error) {
                console.error(
                  "Error auto-populating destinations from pages:",
                  error
                );
                // Fallback to empty destinations menu
                baseItem.children = [];
                baseItem.categoryType = "destinations";
              }
              break;
            case "custom":
              if (item.customItems?.length) {
                baseItem.children = item.customItems
                  .filter((customItem: CustomItem) => customItem.isActive)
                  .map((customItem: CustomItem) => ({
                    label: customItem.label,
                    href: customItem.href,
                  }));
              }
              break;

            case "simple":
            default:
              // No children for simple links
              break;
          }

          return baseItem;
        })
    );

    return transformedItems;
  } catch (error) {
    console.error("Error fetching navigation data:", error);
    return getFallbackNavigation();
  }
});

// Fallback navigation when CMS is unavailable
function getFallbackNavigation(): NavigationItem[] {
  return [
    {
      label: "Ferry",
      href: "/ferry",
    },
    {
      label: "Boat",
      href: "/boat",
    },
    {
      label: "Activities",
      href: "/activities",
    },
    {
      label: "Packages",
      href: "/packages",
    },
    {
      label: "Specials",
      href: "/specials",
    },
    {
      label: "Live Volcanos",
      href: "/live-volcanos",
    },
    {
      label: "Fishing",
      href: "/fishing",
    },
    {
      label: "Experiences",
      href: "/destinations",
      children: [], // Empty children for now, will be populated by CMS
      categoryType: "destinations",
      isClickable: true, // Make the parent destinations link clickable
    },
    {
      label: "Plan Your Trip",
      href: "/plan-your-trip",
    },
    {
      label: "Get in Touch",
      href: "/contact",
      unique: true,
    },
  ];
}
