/**
 * Branding Component
 * Provides customizable branding sections for authentication pages.
 * Supports various layouts, sizes, and visibility options.
 */

import { APP_NAME } from "~/config";

export interface BrandTitleProps {
  /** Font size for the title */
  size?: string;
  /** Custom title text (defaults to "Start building today") */
  children?: React.ReactNode;
}

export interface BrandDescriptionProps {
  /** Font size for the description */
  size?: string;
  /** Custom description text */
  children?: React.ReactNode;
  /** Maximum width of the description */
  maxWidth?: string;
}

export interface BrandingProps {
  /** Custom title props */
  title?: BrandTitleProps;
  /** Custom description props */
  description?: BrandDescriptionProps;
  /** Visibility settings for different breakpoints */
  hidden?: {
    /** Hide on mobile (default false - shows on lg and above) */
    mobile?: boolean;
  };
  /** Content alignment */
  align?: "start" | "center" | "end";
  /** Vertical positioning */
  justify?: "start" | "center" | "end" | "between";
  /** Padding */
  padding?: string;
  /** Custom className */
  className?: string;
  /** Show default branding content */
  showDefaultContent?: boolean;
}

/**
 * BrandTitle - Customizable brand title component
 * @example
 * <BrandTitle size="5xl">Custom Title</BrandTitle>
 */
export function BrandTitle({ size = "4xl", children }: BrandTitleProps) {
  const getMobileSize = (): string => {
    switch (size) {
      case "5xl":
        return "3xl";
      case "4xl":
        return "2xl";
      case "3xl":
        return "xl";
      default:
        return size;
    }
  };

  return (
    <div className={`text-${size} md:text-${getMobileSize()} font-bold tracking-tight`}>
      {children || (
        <>
          Build faster with <span className="text-primary">{APP_NAME}</span>
        </>
      )}
    </div>
  );
}

/**
 * BrandDescription - Customizable brand description component
 * @example
 * <BrandDescription size="xl" maxWidth="xl">Custom description text</BrandDescription>
 */
export function BrandDescription({
  size = "xl",
  children,
  maxWidth = "2xl",
}: BrandDescriptionProps) {
  const getMobileSize = (): string => {
    switch (size) {
      case "xl":
        return "md";
      default:
        return size;
    }
  };

  return (
    <p
      className={`text-${size} md:text-${getMobileSize()} max-w-${maxWidth} text-muted-foreground mx-auto mb-10 leading-relaxed`}
    >
      {children || (
        <>
          The modern full-stack framework combining TypeScript safety with ElysiaJS performance.
          Ship production-ready applications with confidence.
        </>
      )}
    </p>
  );
}

/**
 * Branding - Full branding section component for authentication pages
 * @example
 * <Branding />
 * <Branding align="center" justify="center" />
 * <Branding title={{ size: "5xl" }} description={{ size: "lg", maxWidth: "xl" }} />
 */
export function Branding({
  hidden = { mobile: false },
  align = "start",
  justify = "between",
  padding = "p-12",
  className = "",
  showDefaultContent = true,
  title = {},
  description = {},
}: BrandingProps) {
  const getHiddenClass = (): string => {
    if (hidden.mobile) {
      return "hidden lg:flex";
    }
    return "hidden lg:flex";
  };

  const getJustifyClass = (): string => {
    switch (justify) {
      case "start":
        return "justify-start";
      case "center":
        return "justify-center";
      case "end":
        return "justify-end";
      case "between":
        return "justify-between";
      default:
        return "justify-between";
    }
  };

  const getAlignClass = (): string => {
    switch (align) {
      case "start":
        return "items-start";
      case "center":
        return "items-center";
      case "end":
        return "items-end";
      default:
        return "items-start";
    }
  };

  return (
    <div
      className={`
                lg:w-1/2 
                bg-gradient-to-br from-primary/20 via-primary/10 to-background 
                ${padding} 
                ${getHiddenClass()} 
                ${getJustifyClass()} 
                ${getAlignClass()} 
                flex-col 
                ${className}
            `}
    >
      {showDefaultContent && (
        <div className="space-y-4">
          <BrandTitle {...title} />
          <BrandDescription {...description} />
        </div>
      )}
    </div>
  );
}

/**
 * BrandLogo - Simple logo component for branding sections
 */
export function BrandLogo({
  size = "lg",
  showName = true,
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showName?: boolean;
}) {
  const sizeClasses = {
    xs: "w-6 h-6 text-lg",
    sm: "w-8 h-8 text-xl",
    md: "w-10 h-10 text-2xl",
    lg: "w-12 h-12 text-3xl",
    xl: "w-16 h-16 text-4xl",
  };

  return (
    <>
      <div
        className={`
          rounded-lg flex items-center justify-center 
          ${sizeClasses[size]}
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
          <path
            fill="oklch(0.541 0.281 293.009)"
            d="M12.89 5.64a.184.184 0 0 1-.166-.238a23 23 0 0 1 1.292-3.065a.264.264 0 0 1 .288-.144a19.95 19.95 0 0 1 7.499 2.415a.36.36 0 0 1 .195.363a20.1 20.1 0 0 1-8.721 16.365a.185.185 0 0 1-.283-.086a24 24 0 0 1-.946-3.181a.29.29 0 0 1 .107-.328a16.5 16.5 0 0 0 6.152-10.875a16.5 16.5 0 0 0-5.422-1.226ZM6.301 9.697A13.6 13.6 0 0 1 10.4 8.545c.149-.023.212.081.194.2a26 26 0 0 0-.337 3.209a.23.23 0 0 1-.216.228a10.3 10.3 0 0 0-2.329.759a16.6 16.6 0 0 0 2.617 3.442a.76.76 0 0 1 .211.44a25 25 0 0 0 1.3 4.883a.17.17 0 0 1-.013.2a.19.19 0 0 1-.225 0a20.1 20.1 0 0 1-9.6-16.935a.38.38 0 0 1 .193-.367a20.16 20.16 0 0 1 10.283-2.541a.177.177 0 0 1 .151.274a22 22 0 0 0-1.224 3.099a.24.24 0 0 1-.247.189a16.6 16.6 0 0 0-5.467 1.236a17 17 0 0 0 .61 2.832v.01Z"
          ></path>
        </svg>
      </div>
      {showName && (
        <span className={`font-bold ${sizeClasses[size].split(" ")[1]}`}>{APP_NAME}</span>
      )}
    </>
  );
}