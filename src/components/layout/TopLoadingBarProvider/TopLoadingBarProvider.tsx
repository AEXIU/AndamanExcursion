"use client";
import { createContext, useContext, useRef, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import LoadingBar from "react-top-loading-bar";
import { useClientSearchParams } from "@/hooks/useClientSearchParams";

interface TopLoadingBarContextType {
  start: () => void;
  complete: () => void;
  continuousStart: () => void;
  staticStart: () => void;
}

const TopLoadingBarContext = createContext<
  TopLoadingBarContextType | undefined
>(undefined);

export const useTopLoadingBar = () => {
  const context = useContext(TopLoadingBarContext);
  if (!context) {
    throw new Error(
      "useTopLoadingBar must be used within a TopLoadingBarProvider"
    );
  }
  return context;
};

interface TopLoadingBarProviderProps {
  children: ReactNode;
}

export const TopLoadingBarProvider = ({
  children,
}: TopLoadingBarProviderProps) => {
  const ref = useRef<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { searchParams, SearchParamsLoader } = useClientSearchParams();

  const start = () => {
    ref.current?.continuousStart();
  };

  const complete = () => {
    ref.current?.complete();
  };

  const continuousStart = () => {
    ref.current?.continuousStart();
  };

  const staticStart = () => {
    ref.current?.staticStart();
  };

  useEffect(() => {
    // Global link click handler for Next.js Link components
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[href]") as HTMLAnchorElement;

      if (link && link.href) {
        const url = new URL(link.href, window.location.origin);
        const currentUrl = new URL(window.location.href);

        // Only start loading for internal navigation that changes the route
        if (
          url.origin === currentUrl.origin &&
          (url.pathname !== currentUrl.pathname ||
            url.search !== currentUrl.search)
        ) {
          start();
        }
      }
    };

    // Handle browser back/forward buttons
    const handlePopState = () => {
      start();
    };

    // Add event listeners
    document.addEventListener("click", handleLinkClick, true);
    window.addEventListener("popstate", handlePopState);

    // Intercept router methods (for programmatic navigation)
    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;
    const originalForward = router.forward;

    router.push = (...args) => {
      start();
      return originalPush.apply(router, args);
    };

    router.replace = (...args) => {
      start();
      return originalReplace.apply(router, args);
    };

    router.back = () => {
      start();
      return originalBack.apply(router);
    };

    router.forward = () => {
      start();
      return originalForward.apply(router);
    };

    // Cleanup
    return () => {
      document.removeEventListener("click", handleLinkClick, true);
      window.removeEventListener("popstate", handlePopState);
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
      router.forward = originalForward;
    };
  }, [router, start]);

  useEffect(() => {
    // Complete loading when pathname changes
    const timer = setTimeout(() => {
      complete();
    }, 100); // Reduced from 300ms to 100ms for better UX

    return () => clearTimeout(timer);
  }, [pathname, complete]);

  useEffect(() => {
    // Complete loading when search params change
    const timer = setTimeout(() => {
      complete();
    }, 100); // Reduced from 300ms to 100ms for better UX

    return () => clearTimeout(timer);
  }, [searchParams, complete]);

  return (
    <TopLoadingBarContext.Provider
      value={{ start, complete, continuousStart, staticStart }}
    >
      <LoadingBar
        ref={ref}
        color="var(--color-primary)"
        height={3}
        shadow={true}
        transitionTime={200}
        loaderSpeed={500}
        waitingTime={400}
      />
      <SearchParamsLoader />
      {children}
    </TopLoadingBarContext.Provider>
  );
};
