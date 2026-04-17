import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const headingVariants = cva(
  "font-semibold tracking-tight text-foreground",
  {
    variants: {
      level: {
        h1: "text-3xl md:text-4xl lg:text-5xl",
        h2: "text-2xl md:text-3xl lg:text-4xl",
        h3: "text-xl md:text-2xl lg:text-3xl",
        h4: "text-lg md:text-xl lg:text-2xl",
        h5: "text-base md:text-lg lg:text-xl",
        h6: "text-sm md:text-base lg:text-lg",
      },
      lineHeight: {
        tight: "leading-tight",
        snug: "leading-snug",
        normal: "leading-normal",
        relaxed: "leading-relaxed",
        loose: "leading-loose",
      },
      letterSpacing: {
        tighter: "tracking-tighter",
        tight: "tracking-tight",
        normal: "tracking-normal",
        wide: "tracking-wide",
        wider: "tracking-wider",
        widest: "tracking-widest",
      },
    },
    defaultVariants: {
      level: "h1",
      lineHeight: "tight",
      letterSpacing: "tight",
    },
  }
);

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

function Heading({
  className,
  level,
  as,
  lineHeight,
  letterSpacing,
  ...props
}: HeadingProps) {
  const Component = as || (level || "h1");
  return (
    <Component
      className={cn(headingVariants({ level: level || as, lineHeight, letterSpacing }), className)}
      {...props}
    />
  );
}

const textVariants = cva("text-foreground", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    variant: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
    },
    lineHeight: {
      tight: "leading-tight",
      snug: "leading-snug",
      normal: "leading-normal",
      relaxed: "leading-relaxed",
      loose: "leading-loose",
    },
    letterSpacing: {
      tighter: "tracking-tighter",
      tight: "tracking-tight",
      normal: "tracking-normal",
      wide: "tracking-wide",
      wider: "tracking-wider",
      widest: "tracking-widest",
    },
  },
  defaultVariants: {
    size: "base",
    weight: "normal",
    variant: "default",
    lineHeight: "relaxed",
    letterSpacing: "normal",
  },
});

interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div";
}

function Text({
  className,
  size,
  weight,
  variant,
  lineHeight,
  letterSpacing,
  as = "p",
  ...props
}: TextProps) {
  const Component = as;
  return (
    <Component
      className={cn(textVariants({ size, weight, variant, lineHeight, letterSpacing }), className)}
      {...props}
    />
  );
}

const codeVariants = cva(
  "font-mono rounded bg-muted px-1.5 py-0.5 text-sm font-medium text-foreground",
  {
    variants: {
      variant: {
        inline: "inline",
        block: "block w-full p-4",
      },
    },
    defaultVariants: {
      variant: "inline",
    },
  }
);

interface CodeProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof codeVariants> {
  as?: "code" | "pre";
}

function Code({
  className,
  variant,
  as,
  ...props
}: CodeProps) {
  const Component = variant === "block" ? "pre" : (as || "code");
  return (
    <Component
      className={cn(codeVariants({ variant }), className)}
      {...props}
    />
  );
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "default" | "muted" | "primary";
}

function Link({
  className,
  variant = "primary",
  ...props
}: LinkProps) {
  return (
    <a
      className={cn(
        "underline-offset-4 hover:underline transition-colors",
        variant === "default" && "text-foreground",
        variant === "muted" && "text-muted-foreground",
        variant === "primary" && "text-primary",
        className
      )}
      {...props}
    />
  );
}

export { Heading, Text, Code, Link, headingVariants, textVariants, codeVariants };

