"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

/* -------------------------------------------------------------------------- */
/*                              MessageScroller                               */
/* -------------------------------------------------------------------------- */

export interface MessageScrollerProps extends React.HTMLAttributes<HTMLDivElement> {
  autoScroll?: boolean;
}

const MessageScroller = React.forwardRef<HTMLDivElement, MessageScrollerProps>(
  ({ className, children, autoScroll = true, ...props }, ref) => {
    const internalRef = React.useRef<HTMLDivElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;

    React.useEffect(() => {
      if (autoScroll && resolvedRef.current) {
        resolvedRef.current.scrollTop = resolvedRef.current.scrollHeight;
      }
    });

    return (
      <div
        ref={resolvedRef}
        className={cn(
          "flex-1 overflow-y-auto overscroll-contain p-4 space-y-3.5 scroll-smooth",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
MessageScroller.displayName = "MessageScroller";

/* -------------------------------------------------------------------------- */
/*                                   Message                                  */
/* -------------------------------------------------------------------------- */

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from?: "user" | "assistant" | "system";
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, from = "assistant", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-from={from}
        className={cn(
          "flex gap-2.5 max-w-[90%]",
          from === "user" ? "ml-auto flex-row-reverse items-end" : "mr-auto flex-row items-start",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Message.displayName = "Message";

/* -------------------------------------------------------------------------- */
/*                                MessageAvatar                               */
/* -------------------------------------------------------------------------- */

export interface MessageAvatarProps extends React.ComponentPropsWithoutRef<typeof Avatar> {
  src?: string;
  fallback?: React.ReactNode;
}

const MessageAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  MessageAvatarProps
>(({ className, src, fallback, ...props }, ref) => {
  return (
    <Avatar ref={ref} className={cn("h-7 w-7 shrink-0 select-none", className)} {...props}>
      {src && <AvatarImage src={src} />}
      <AvatarFallback className="text-[10px] font-bold bg-[#e0f0ec] text-[#167c74]">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
});
MessageAvatar.displayName = "MessageAvatar";

/* -------------------------------------------------------------------------- */
/*                                   Bubble                                   */
/* -------------------------------------------------------------------------- */

export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "muted";
}

const Bubble = React.forwardRef<HTMLDivElement, BubbleProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed transition-all",
          variant === "primary" && "bg-[#167c74] text-white rounded-br-xs",
          variant === "default" && "border border-[#dce8e5] bg-white text-[#152321] rounded-bl-xs",
          variant === "muted" && "border border-[#e2ece8] bg-[#f2f7f5] text-[#2c3e39]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Bubble.displayName = "Bubble";

/* -------------------------------------------------------------------------- */
/*                                   Marker                                   */
/* -------------------------------------------------------------------------- */

export interface MarkerProps extends React.HTMLAttributes<HTMLDivElement> {}

const Marker = React.forwardRef<HTMLDivElement, MarkerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-1.5 py-1 px-3 text-[10px] font-medium text-[#405e54] bg-[#eaf4ef] border border-[#cfe3dd] rounded-xl my-1",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Marker.displayName = "Marker";

/* -------------------------------------------------------------------------- */
/*                                 Attachment                                 */
/* -------------------------------------------------------------------------- */

export interface AttachmentProps extends React.HTMLAttributes<HTMLDivElement> {}

const Attachment = React.forwardRef<HTMLDivElement, AttachmentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-[#cfe3dd] bg-[#edf7f4] px-2.5 py-1 text-[11px] font-semibold text-[#167c74] transition-colors hover:bg-[#167c74] hover:text-white",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Attachment.displayName = "Attachment";

export {
  MessageScroller,
  Message,
  MessageAvatar,
  Bubble,
  Marker,
  Attachment,
};
