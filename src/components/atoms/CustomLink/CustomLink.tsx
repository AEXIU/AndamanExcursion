"use client";
import {
  NavigationMenuLink,
  NavigationMenuLinkProps,
} from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CustomLinkProps } from "./CustomLink.types";

export const CustomLink = ({
  children,
  href,
  external,
  className,
  ...props
}: CustomLinkProps & Omit<NavigationMenuLinkProps, "href">) => {
  const pathname = usePathname();
  const isActive = href === pathname;

  if (external) {
    return (
      <NavigationMenuLink
        asChild
        aria-current={isActive ? "page" : undefined}
        {...props}
      >
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {children}
        </a>
      </NavigationMenuLink>
    );
  }

  return (
    <NavigationMenuLink
      asChild
      active={isActive}
      aria-current={isActive ? "page" : undefined}
      {...props}
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </NavigationMenuLink>
  );
};
