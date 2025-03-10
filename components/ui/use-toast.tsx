'use client';

// Copied from shadcn/ui toast component
import * as React from "react";
import { Toast, type ToastActionElement, ToastProps, ToastAction } from "@/components/ui/toast";
import {
  ToastProvider,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast as useToastImpl } from "@/components/ui/toast";

export type ToastActionProps = React.ComponentPropsWithoutRef<typeof ToastAction>;

export function Toaster() {
  const { toasts } = useToastImpl();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <div className="font-medium">{title}</div>}
              {description && (
                <div className="text-sm opacity-90">{description}</div>
              )}
            </div>
            {action}
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

export { useToastImpl as useToast }; 