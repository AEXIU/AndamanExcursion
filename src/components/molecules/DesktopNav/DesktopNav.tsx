"use client";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@radix-ui/react-navigation-menu";
import { ChevronDown, MoveRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import type { DesktopNavProps } from "./DesktopNav.types";
import styles from "./DesktopNav.module.css";
import { CustomLink } from "@/components/atoms";

export const DesktopNav = React.memo(
  ({ items, className }: DesktopNavProps) => {
    const pathname = usePathname();
    const router = useRouter();

    return (
      <NavigationMenu className={clsx(styles.navigationMenu, className)}>
        <NavigationMenuList className={styles.navigationMenuList}>
          {items.map((item) => (
            <NavigationMenuItem
              className={styles.navigationMenuItem}
              key={item.label}
            >
              {!item.children ? (
                <CustomLink
                  className={clsx(
                    styles.navigationMenuLink,
                    pathname === item.href && styles.active,
                    item.unique && styles.navigationMenuLinkUnique
                  )}
                  href={item.href}
                >
                  {item.label}
                  {item.unique && <MoveRight size={16} aria-hidden="true" />}
                </CustomLink>
              ) : (
                <div className={styles.navigationMenuItemWithDropdown}>
                  {item.isClickable ? (
                    // For clickable parent items with dropdowns - use button with click handler
                    <NavigationMenuTrigger
                      className={clsx(
                        styles.navigationMenuTrigger,
                        styles.navigationMenuTriggerClickable
                      )}
                      onClick={(e) => {
                        // Navigate to the parent item's href when clicked
                        if (item.href) {
                          router.push(item.href);
                        }
                      }}
                    >
                      <span
                        className={clsx(
                          styles.triggerLabel,
                          pathname === item.href && styles.active
                        )}
                      >
                        {item.label}
                      </span>
                      <ChevronDown
                        size={16}
                        className={styles.navigationMenuTriggerIcon}
                        aria-hidden="true"
                      />
                    </NavigationMenuTrigger>
                  ) : (
                    // For non-clickable parent items
                    <NavigationMenuTrigger
                      className={styles.navigationMenuTrigger}
                    >
                      <span className={styles.triggerLabel}>{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={styles.navigationMenuTriggerIcon}
                        aria-hidden="true"
                      />
                    </NavigationMenuTrigger>
                  )}
                  <NavigationMenuContent
                    className={styles.navigationMenuContent}
                  >
                    {item.categoryType === "destinations" ? (
                      // Special nested layout for destinations
                      <div className={styles.nestedDestinationsDropdown}>
                        {item.children?.map((mainCategory) => (
                          <div
                            key={mainCategory.label}
                            className={styles.mainCategorySection}
                          >
                            <CustomLink
                              href={mainCategory.href}
                              className={clsx(
                                styles.mainCategoryLink,
                                pathname === mainCategory.href && styles.active
                              )}
                            >
                              {mainCategory.label}
                            </CustomLink>
                            {mainCategory.children?.length && (
                              <div className={styles.subcategoryList}>
                                {mainCategory.children.map((subcategory) => (
                                  <CustomLink
                                    key={subcategory.label}
                                    href={subcategory.href}
                                    className={clsx(
                                      styles.subcategoryLink,
                                      pathname === subcategory.href &&
                                        styles.active
                                    )}
                                  >
                                    {subcategory.label}
                                  </CustomLink>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Standard dropdown layout for other navigation types
                      <div
                        className={clsx(
                          styles.navigationMenuDropdown,
                          item.children.length >= 6 &&
                            styles.navigationMenuDropdownGrid
                        )}
                      >
                        {item.children.map((child) => (
                          <CustomLink
                            className={clsx(
                              styles.navigationMenuLink,
                              pathname === child.href && styles.active
                            )}
                            key={child.label}
                            href={child.href}
                          >
                            {child.label}
                          </CustomLink>
                        ))}
                      </div>
                    )}
                  </NavigationMenuContent>
                </div>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    );
  }
);

DesktopNav.displayName = "DesktopNav";
