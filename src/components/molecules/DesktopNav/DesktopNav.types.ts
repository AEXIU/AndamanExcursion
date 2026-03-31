export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
  unique?: boolean;
  isClickable?: boolean; // Indicates if the parent item should be clickable even with children
  isMainCategory?: boolean; // For styling main categories in nested dropdowns (bold, darker)
  isSubCategory?: boolean; // For styling subcategories in nested dropdowns (lighter)
  categoryType?:
    | "destinations"
    | "activities"
    | "packages"
    | "specials"
    | "custom"
    | "simple"; // Type of navigation category
}

export interface BaseNavProps {
  items: NavigationItem[];
  className?: string;
}

export type DesktopNavProps = BaseNavProps;
