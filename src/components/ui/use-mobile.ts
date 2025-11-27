import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    // Check if window and matchMedia are available (browser compatibility)
    if (typeof window === 'undefined' || !window.matchMedia) {
      setIsMobile(false);
      return;
    }

    try {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      const onChange = () => {
        if (typeof window !== 'undefined' && window.innerWidth !== undefined) {
          setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        }
      };
      
      // Use addEventListener if available, fallback to addListener for older browsers
      if (mql.addEventListener) {
        mql.addEventListener("change", onChange);
      } else if (mql.addListener) {
        // Fallback for older browsers (Safari < 14, etc.)
        mql.addListener(onChange);
      }
      
      if (typeof window !== 'undefined' && window.innerWidth !== undefined) {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }
      
      return () => {
        if (mql.removeEventListener) {
          mql.removeEventListener("change", onChange);
        } else if (mql.removeListener) {
          // Fallback for older browsers
          mql.removeListener(onChange);
        }
      };
    } catch (error) {
      // Fallback if matchMedia fails
      setIsMobile(false);
    }
  }, []);

  return !!isMobile;
}
