import type { NavigationItem } from "@/components/molecules/DesktopNav/DesktopNav.types";

export interface HeaderProps {
  className?: string;
}

export interface HeaderContent {
  logo: {
    src: string;
    alt: string;
  };
  navigation: NavigationItem[];
}
