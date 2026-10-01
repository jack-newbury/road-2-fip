"use client";

import { PrimaryButton } from "@/components/ui";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

/** Instant pending feedback for server-action forms */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton
      type="submit"
      disabled={pending || props.disabled}
      className={className}
      {...props}
    >
      {pending ? pendingLabel : children}
    </PrimaryButton>
  );
}
