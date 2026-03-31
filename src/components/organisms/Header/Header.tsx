"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { DesktopNav } from "@/components/molecules/DesktopNav/DesktopNav";
import { MobileNav } from "@/components/molecules/MobileNav/MobileNav";
import styles from "./Header.module.css";
import logo from "@icons/logo.svg";
import type { HeaderProps } from "./Header.types";
import type { NavigationItem } from "@/components/molecules/DesktopNav/DesktopNav.types";

// Throttle function to limit how often a function runs
const throttle = (callback: Function, delay = 250) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return (...args: any[]) => {
    const currentTime = Date.now();
    const timeSinceLastExec = currentTime - lastExecTime;

    const execute = () => {
      lastExecTime = Date.now();
      callback(...args);
    };

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (timeSinceLastExec > delay) {
      execute();
    } else {
      timeoutId = setTimeout(execute, delay - timeSinceLastExec);
    }
  };
};

interface HeaderWithNavigationProps extends HeaderProps {
  navItems?: NavigationItem[];
}

export const Header = React.memo(
  ({ className, navItems = [], ...props }: HeaderWithNavigationProps) => {
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    // Memoize the scroll handler with useCallback to prevent unnecessary re-renders
    const handleScroll = useCallback(
      throttle(() => {
        const currentScrollPos = window.scrollY;

        // Set scrolled state for styling
        setScrolled(currentScrollPos > 20);

        // Determine visibility based on scroll direction
        // Only hide header after scrolling down a bit (50px threshold)
        if (currentScrollPos > prevScrollPos && currentScrollPos > 50) {
          // Scrolling down - hide header
          setVisible(false);
        } else {
          // Scrolling up - show header
          setVisible(true);
        }

        setPrevScrollPos(currentScrollPos);
      }, 100),
      [prevScrollPos]
    );

    useEffect(() => {
      window.addEventListener("scroll", handleScroll);

      // Set initial states based on current scroll position
      const initialScroll = window.scrollY;
      setScrolled(initialScroll > 20);

      return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    return (
      <header
        className={clsx(
          styles.header_root,
          scrolled && styles.scrolled,
          !visible && styles.hidden,
          className
        )}
        {...props}
        aria-hidden={!visible}
      >
        <div className={styles.header_container}>
          <div className={styles.logo}>
            <Link href="/">
              <Image
                src={logo}
                alt="Andaman Excursion"
                width={150}
                height={50}
                style={{ width: "auto" }}
                priority
              />
            </Link>
          </div>

          <DesktopNav items={navItems} className={styles.desktopNav} />

          <MobileNav items={navItems} className={styles.mobileNav} />
        </div>
      </header>
    );
  }
);

Header.displayName = "Header";
