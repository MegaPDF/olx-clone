"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

interface RTLContextType {
  isRTL: boolean;
  direction: "ltr" | "rtl";
  toggleDirection: () => void;
  setDirection: (direction: "ltr" | "rtl") => void;
}

const RTLContext = createContext<RTLContextType | undefined>(undefined);

interface RTLProviderProps {
  children: React.ReactNode;
  defaultDirection?: "ltr" | "rtl";
  forceDirection?: "ltr" | "rtl";
  className?: string;
}

// RTL languages configuration
const RTL_LANGUAGES: Locale[] = [
  // Add RTL language codes here when supported
  // 'ar', 'he', 'fa', 'ur', etc.
];

export function RTLProvider({
  children,
  defaultDirection,
  forceDirection,
  className,
}: RTLProviderProps) {
  const { i18n } = useTranslation();
  const [direction, setDirectionState] = useState<"ltr" | "rtl">(
    forceDirection || defaultDirection || "ltr"
  );

  // Determine if current language is RTL
  const isCurrentLanguageRTL = RTL_LANGUAGES.includes(i18n.language as Locale);

  // Auto-detect direction based on language if not forced
  useEffect(() => {
    if (!forceDirection) {
      const autoDirection = isCurrentLanguageRTL ? "rtl" : "ltr";
      setDirectionState(autoDirection);
    }
  }, [i18n.language, isCurrentLanguageRTL, forceDirection]);

  // Update document direction
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = direction;
      document.documentElement.setAttribute("data-direction", direction);

      // Add/remove RTL class for styling
      if (direction === "rtl") {
        document.documentElement.classList.add("rtl");
      } else {
        document.documentElement.classList.remove("rtl");
      }
    }
  }, [direction]);

  const toggleDirection = () => {
    if (!forceDirection) {
      setDirectionState((prev) => (prev === "ltr" ? "rtl" : "ltr"));
    }
  };

  const setDirection = (newDirection: "ltr" | "rtl") => {
    if (!forceDirection) {
      setDirectionState(newDirection);
    }
  };

  const isRTL = direction === "rtl";

  const contextValue: RTLContextType = {
    isRTL,
    direction,
    toggleDirection,
    setDirection,
  };

  return (
    <RTLContext.Provider value={contextValue}>
      <div
        dir={direction}
        className={cn("transition-all duration-200", isRTL && "rtl", className)}
        data-direction={direction}
      >
        {children}
      </div>
    </RTLContext.Provider>
  );
}

// Hook to use RTL context
export function useRTL() {
  const context = useContext(RTLContext);
  if (context === undefined) {
    throw new Error("useRTL must be used within an RTLProvider");
  }
  return context;
}

// Hook for RTL-aware positioning
export function useRTLPosition() {
  const { isRTL } = useRTL();

  const getPosition = (leftPosition: string, rightPosition?: string) => {
    if (!rightPosition) rightPosition = leftPosition;
    return isRTL ? rightPosition : leftPosition;
  };

  const getFloatDirection = () => (isRTL ? "right" : "left");
  const getTextAlign = () => (isRTL ? "right" : "left");

  return {
    isRTL,
    getPosition,
    getFloatDirection,
    getTextAlign,
    left: isRTL ? "right" : "left",
    right: isRTL ? "left" : "right",
  };
}

// Component for RTL-aware spacing
interface RTLSpacingProps {
  children: React.ReactNode;
  className?: string;
  ml?: string; // margin-left in LTR, margin-right in RTL
  mr?: string; // margin-right in LTR, margin-left in RTL
  pl?: string; // padding-left in LTR, padding-right in RTL
  pr?: string; // padding-right in LTR, padding-left in RTL
}

export function RTLSpacing({
  children,
  className,
  ml,
  mr,
  pl,
  pr,
}: RTLSpacingProps) {
  const { isRTL } = useRTL();

  const spacing = cn(
    // Margin
    ml && (isRTL ? `mr-${ml.replace("ml-", "")}` : ml),
    mr && (isRTL ? `ml-${mr.replace("mr-", "")}` : mr),
    // Padding
    pl && (isRTL ? `pr-${pl.replace("pl-", "")}` : pl),
    pr && (isRTL ? `pl-${pr.replace("pr-", "")}` : pr),
    className
  );

  return <div className={spacing}>{children}</div>;
}

// RTL-aware icon component
interface RTLIconProps {
  icon: React.ReactNode;
  flip?: boolean; // Whether to flip the icon in RTL
  className?: string;
}

export function RTLIcon({ icon, flip = false, className }: RTLIconProps) {
  const { isRTL } = useRTL();

  return (
    <span className={cn(flip && isRTL && "scale-x-[-1]", className)}>
      {icon}
    </span>
  );
}

// RTL-aware flex direction utilities
export function useRTLFlexDirection() {
  const { isRTL } = useRTL();

  return {
    row: isRTL ? "flex-row-reverse" : "flex-row",
    rowReverse: isRTL ? "flex-row" : "flex-row-reverse",
    col: "flex-col", // Columns don't change in RTL
    colReverse: "flex-col-reverse", // Columns don't change in RTL
  };
}

// Higher-order component for RTL support
export function withRTL<P extends object>(Component: React.ComponentType<P>) {
  const RTLComponent = (props: P) => {
    const rtlProps = useRTL();
    return <Component {...props} {...rtlProps} />;
  };

  RTLComponent.displayName = `withRTL(${
    Component.displayName || Component.name
  })`;
  return RTLComponent;
}

// Utility function to get RTL-aware CSS values
export function getRTLValue(ltrValue: string, rtlValue?: string) {
  const { isRTL } = useRTL();
  return isRTL ? rtlValue || ltrValue : ltrValue;
}

// CSS-in-JS helper for RTL styles
export function rtlStyle(styles: {
  ltr?: React.CSSProperties;
  rtl?: React.CSSProperties;
  common?: React.CSSProperties;
}) {
  const { isRTL } = useRTL();

  return {
    ...styles.common,
    ...(isRTL ? styles.rtl : styles.ltr),
  };
}
