"use client";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import styles from "./PageBackgroundProvider.module.css";

export function PageBackgroundProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Generate CSS class based on pathname, including subpages
  const getPageClass = (path: string) => {
    // Check exact matches first
    if (path === "/") return "page-home";

    // Check if path starts with main routes (for subpages)
    if (path.startsWith("/about")) return "page-about";
    if (
      path.startsWith("/packages") ||
      path.startsWith("/boat") ||
      path.startsWith("/activities")
    )
      return "page-packages";
    if (path.startsWith("/contact")) return "page-contact";
    if (path.startsWith("/plan-your-trip")) return "page-plan-your-trip";
    if (
      path.startsWith("/specials") ||
      path.startsWith("/destinations/") ||
      path.startsWith("/live-volcanos") ||
      path.startsWith("/fishing")
    )
      return "page-specials";

    return "page-default";
  };

  return (
    <main
      className={cn(styles.pageBackground, styles[`${getPageClass(pathname)}`])}
    >
      {children}
    </main>
  );
}
