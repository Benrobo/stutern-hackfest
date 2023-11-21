import React, { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface FlexProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  className?: React.ComponentProps<"div">["className"];
}

export const FlexColStart = React.forwardRef(
  ({ children, className, ...props }: FlexProps, ref) => {
    return (
      <div
        className={twMerge(
          "w-auto flex flex-col items-start justify-start gap-3",
          className
        )}
        {...props}
        ref={ref as any}
      >
        {children}
      </div>
    );
  }
);

FlexColStart.displayName = "FlexColStart";

export const FlexColEnd = React.forwardRef(
  ({ children, className, ...props }: FlexProps, ref) => {
    return (
      <div
        className={twMerge(
          "w-auto flex flex-col items-end justify-end gap-3",
          className
        )}
        {...props}
        ref={ref as any}
      >
        {children}
      </div>
    );
  }
);

FlexColEnd.displayName = "FlexColEnd";

export const FlexColCenter = React.forwardRef(
  ({ children, className, ...props }: FlexProps, ref) => {
    return (
      <div
        className={twMerge(
          "w-auto flex flex-col items-center justify-center gap-3",
          className
        )}
        {...props}
        ref={ref as any}
      >
        {children}
      </div>
    );
  }
);

FlexColCenter.displayName = "FlexColCenter";

export const FlexStartColCenter = React.forwardRef(
  ({ children, className, ...props }: FlexProps, ref) => {
    return (
      <div
        className={twMerge(
          "w-auto flex flex-col items-center justify-start gap-3",
          className
        )}
        {...props}
        ref={ref as any}
      >
        {children}
      </div>
    );
  }
);

FlexStartColCenter.displayName = "FlexStartColCenter";

export const FlexRowStart = React.forwardRef(
  ({ children, className, ...props }: FlexProps, ref) => {
    return (
      <div
        className={twMerge(
          "w-auto flex items-start justify-start gap-3",
          className
        )}
        {...props}
        ref={ref as any}
      >
        {children}
      </div>
    );
  }
);

FlexRowStart.displayName = "FlexRowStart";

export const FlexRowStartCenter = React.forwardRef(
  ({ children, className, ...props }: FlexProps, ref) => {
    return (
      <div
        className={twMerge(
          "w-auto flex items-center justify-start gap-3",
          className
        )}
        {...props}
        ref={ref as any}
      >
        {children}
      </div>
    );
  }
);

FlexRowStartCenter.displayName = "FlexRowStartCenter";

export const FlexRowCenter = React.forwardRef(
  ({ children, className, ...props }: FlexProps, ref) => {
    return (
      <div
        className={twMerge(
          "w-auto flex items-center justify-center gap-3",
          className
        )}
        {...props}
        ref={ref as any}
      >
        {children}
      </div>
    );
  }
);

FlexRowCenter.displayName = "FlexRowCenter";


export const FlexRowCenterBtw = React.forwardRef(
  ({ children, className, ...props }: FlexProps, ref) => {
    return (
      <div
        className={twMerge(
          "w-auto flex items-center justify-between gap-3",
          className
        )}
        {...props}
        ref={ref as any}
      >
        {children}
      </div>
    );
  }
);

FlexRowCenterBtw.displayName = "FlexRowCenterBtw";

export const FlexRowStartBtw = React.forwardRef(
  ({ children, className, ...props }: FlexProps, ref) => {
    return (
      <div
        className={twMerge(
          "w-auto flex items-start justify-between gap-3",
          className
        )}
        {...props}
        ref={ref as any}
      >
        {children}
      </div>
    );
  }
);

FlexRowStartBtw.displayName = "FlexRowStartBtw";