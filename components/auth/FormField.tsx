import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
        <input
          ref={ref}
          className={cn(
            "w-full bg-background border rounded-xl px-4 py-2.5 text-sm text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring transition-all",
            error ? "border-destructive focus:ring-destructive/30" : "border-border",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";

interface SubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function SubmitButton({ children, loading, className }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        "w-full bg-primary text-primary-foreground rounded-xl py-2.5 font-semibold text-sm",
        "hover:bg-primary/90 transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "flex items-center justify-center gap-2",
        className
      )}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          در حال پردازش...
        </>
      ) : children}
    </button>
  );
}

interface AlertBoxProps {
  type: "error" | "success";
  message: string;
}

export function AlertBox({ type, message }: AlertBoxProps) {
  return (
    <div
      className={cn(
        "rounded-xl px-4 py-3 text-sm",
        type === "error"
          ? "bg-destructive/10 text-destructive border border-destructive/20"
          : "bg-green-500/10 text-green-500 border border-green-500/20"
      )}
    >
      {message}
    </div>
  );
}
