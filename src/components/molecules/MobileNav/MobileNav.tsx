"use client";
import React, { useState, useCallback } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@radix-ui/react-navigation-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { CustomLink } from "@/components/atoms";
import styles from "./MobileNav.module.css";
import type { MobileNavProps } from "./MobileNav.types";

export const MobileNav = React.memo(({ items, className }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleLinkClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button
          className={clsx(styles.trigger, className)}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
        >
          <Menu size={24} aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={styles.content}
          onInteractOutside={handleClose}
          onEscapeKeyDown={handleClose}
        >
          <div className={styles.header}>
            <Dialog.Title asChild>
              <VisuallyHidden>Navigation Menu</VisuallyHidden>
            </Dialog.Title>
            <Dialog.Close
              className={styles.close}
              aria-label="Close navigation menu"
            >
              <X size={24} aria-hidden="true" />
            </Dialog.Close>
          </div>

          <NavigationMenu className={styles.nav}>
            <NavigationMenuList className={styles.list}>
              {items.map((item) => (
                <NavigationMenuItem key={item.label} className={styles.item}>
                  {!item.children ? (
                    <CustomLink
                      href={item.href}
                      className={clsx(
                        styles.link,
                        pathname === item.href && styles.active,
                        item.unique && styles.unique
                      )}
                      onClick={handleLinkClick}
                    >
                      {item.label}
                    </CustomLink>
                  ) : (
                    <div className={styles.dropdownContainer}>
                      {item.isClickable && (
                        <CustomLink
                          href={item.href}
                          className={clsx(
                            styles.link,
                            styles.parentLink,
                            pathname === item.href && styles.active
                          )}
                          onClick={handleLinkClick}
                        >
                          {item.label}
                        </CustomLink>
                      )}
                      <NavigationMenuTrigger className={styles.dropdownTrigger}>
                        {!item.isClickable && <span>{item.label}</span>}
                        {item.isClickable ? (
                          <span className={styles.dropdownLabel}>
                            {item.label} Submenu
                          </span>
                        ) : null}
                        <ChevronDown
                          size={16}
                          className={styles.dropdownIcon}
                          aria-hidden="true"
                        />
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className={styles.dropdownContent}>
                        {item.categoryType === "destinations" ? (
                          // Special nested layout for destinations in mobile
                          <div className={styles.nestedDestinationsDropdown}>
                            {item.children?.map((mainCategory) => (
                              <div
                                key={mainCategory.label}
                                className={styles.mainCategorySection}
                              >
                                <CustomLink
                                  href={mainCategory.href}
                                  className={clsx(
                                    styles.link,
                                    styles.mainCategoryLink,
                                    pathname === mainCategory.href &&
                                      styles.active
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  {mainCategory.label}
                                </CustomLink>
                                {mainCategory.children?.length && (
                                  <div className={styles.subcategoryList}>
                                    {mainCategory.children.map(
                                      (subcategory) => (
                                        <CustomLink
                                          key={subcategory.label}
                                          href={subcategory.href}
                                          className={clsx(
                                            styles.link,
                                            styles.childLink,
                                            styles.subcategoryLink,
                                            pathname === subcategory.href &&
                                              styles.active
                                          )}
                                          onClick={handleLinkClick}
                                        >
                                          {subcategory.label}
                                        </CustomLink>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Standard dropdown layout for other navigation types
                          <div
                            className={clsx(
                              styles.dropdown,
                              item.children.length > 6 && styles.dropdownGrid
                            )}
                          >
                            {item.children.map((child) => (
                              <CustomLink
                                key={child.label}
                                href={child.href}
                                className={clsx(
                                  styles.link,
                                  styles.childLink,
                                  pathname === child.href && styles.active
                                )}
                                onClick={handleLinkClick}
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

MobileNav.displayName = "MobileNav";
