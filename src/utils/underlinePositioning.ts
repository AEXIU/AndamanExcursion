// utils/underlinePositioning.ts
import { useEffect, useState, RefObject, useCallback, useRef } from "react";

// Detect Safari/WebKit (covers both macOS Safari and iOS Safari, but not Chrome on iOS)
const isSafariWebKit = (): boolean => {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  // Safari UA contains 'Safari' but not 'Chrome' or 'CriOS' (Chrome on iOS)
  return /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
};

export interface UnderlinePosition {
  left: number;
  top: number;
  width: number;
}

export interface UseUnderlinePositioningProps {
  containerRef: RefObject<HTMLElement | null>;
  targetRefs: RefObject<Map<number, HTMLElement>>;
  dependencies?: any[];
  offset?: number;
  debounceMs?: number;
}

export const useUnderlinePositioning = ({
  containerRef,
  targetRefs,
  dependencies = [],
  offset = 8,
  debounceMs = 100,
}: UseUnderlinePositioningProps) => {
  // On Safari, getClientRects() returns a tighter rect.bottom (closer to the actual glyph
  // baseline, with less line-height whitespace below). Using the normal offset subtracts
  // too much from `top`, pushing the underline UP into the text glyphs.
  // Fix: use offset=0 on Safari so the underline is placed AT the text bottom.
  // A CSS translateY then adds the visual gap (see SectionTitle.module.css / Trivia.module.css).
  const effectiveOffset = isSafariWebKit() ? 0 : offset;
  const [positions, setPositions] = useState<UnderlinePosition[]>([]);

  const calculatePositions = useCallback(() => {
    if (
      !containerRef.current ||
      !targetRefs.current ||
      targetRefs.current.size === 0
    ) {
      setPositions([]);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const allPositions: UnderlinePosition[] = [];

    targetRefs.current.forEach((ref) => {
      if (!ref) return;

      try {
        // Handle multi-line text using getClientRects
        const rects = ref.getClientRects();

        Array.from(rects).forEach((rect) => {
          // Only add positions for visible rectangles
          if (rect.width > 0 && rect.height > 0) {
            const left = rect.left - containerRect.left;
            const top = rect.bottom - containerRect.top;

            allPositions.push({
              left: Math.max(0, left), // Prevent negative positioning
              top: top - effectiveOffset,
              width: rect.width,
            });
          }
        });
      } catch (error) {
        console.warn("Error calculating underline position:", error);
      }
    });

    setPositions(allPositions);
  }, [containerRef, targetRefs, offset]);

  // Debounced calculation function
  const debouncedCalculate = useCallback(() => {
    const timeoutId = setTimeout(calculatePositions, debounceMs);
    return () => clearTimeout(timeoutId);
  }, [calculatePositions, debounceMs]);

  // Calculate on mount and dependency changes
  useEffect(() => {
    const cleanup = debouncedCalculate();
    return cleanup;
  }, [...dependencies, calculatePositions]);

  // Handle resize with debouncing
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(calculatePositions, debounceMs);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [calculatePositions, debounceMs]);

  // Recalculate when fonts load (important for accurate positioning)
  useEffect(() => {
    const handleFontLoad = () => {
      setTimeout(calculatePositions, 50); // Small delay after font load
    };

    if (document.fonts) {
      document.fonts.addEventListener("loadingdone", handleFontLoad);
      return () =>
        document.fonts.removeEventListener("loadingdone", handleFontLoad);
    }
  }, [calculatePositions]);

  // Handle orientation change on mobile
  useEffect(() => {
    const handleOrientationChange = () => {
      setTimeout(calculatePositions, 200); // Longer delay for orientation change
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    return () =>
      window.removeEventListener("orientationchange", handleOrientationChange);
  }, [calculatePositions]);

  return {
    positions,
    recalculate: calculatePositions,
  };
};

// Specialized hook for text highlighting components
export const useTextHighlightUnderlines = (
  containerRef: RefObject<HTMLElement | null>,
  highlightRefs: RefObject<Map<number, HTMLElement>>,
  highlightedPhrases: any[],
  offset: number = 8
) => {
  return useUnderlinePositioning({
    containerRef,
    targetRefs: highlightRefs,
    dependencies: [highlightedPhrases],
    offset,
    debounceMs: 100,
  });
};

// Specialized hook for single element underlining (like SectionTitle)
// export const useSingleElementUnderline = (
//   containerRef: RefObject<HTMLElement | null>,
//   targetRef: RefObject<HTMLElement | null>,
//   dependencies: any[] = [],
//   offset: number = 10
// ) => {
//   const targetRefsMap = useRef<Map<number, HTMLElement>>(new Map());

//   // Update the map when targetRef changes
//   useEffect(() => {
//     if (targetRef.current) {
//       targetRefsMap.current.set(0, targetRef.current);
//     } else {
//       targetRefsMap.current.clear();
//     }
//   }, [targetRef.current, ...dependencies]);

//   return useUnderlinePositioning({
//     containerRef,
//     targetRefs: targetRefsMap,
//     dependencies,
//     offset,
//     debounceMs: 50, // Faster for single elements
//   });
// };

// Helper function to convert rem to pixels
const remToPx = (rem: number): number => {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};

// Update the useSingleElementUnderline hook signature
export const useSingleElementUnderline = (
  containerRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>,
  dependencies: any[] = [],
  offset: number | string = 10 // Can now accept "0.625rem" or 10
) => {
  const targetRefsMap = useRef<Map<number, HTMLElement>>(new Map());

  // Convert offset to pixels if it's a rem value
  const getOffsetInPixels = useCallback(() => {
    if (typeof offset === "string" && offset.endsWith("rem")) {
      const remValue = parseFloat(offset.replace("rem", ""));
      return remToPx(remValue);
    }
    return typeof offset === "number" ? offset : 10;
  }, [offset]);

  // Update the map when targetRef changes
  useEffect(() => {
    if (targetRef.current) {
      targetRefsMap.current.set(0, targetRef.current);
    } else {
      targetRefsMap.current.clear();
    }
  }, [targetRef.current, ...dependencies]);

  return useUnderlinePositioning({
    containerRef,
    targetRefs: targetRefsMap,
    dependencies,
    offset: getOffsetInPixels(),
    debounceMs: 50,
  });
};
