// packages/frontend/components/ui/form-field-error.tsx
import { FieldError } from "react-hook-form";

interface FormFieldErrorProps {
  error?: FieldError | { message?: string };
}

/**
 * Renders a validation error message for a form field.
 * Accepts a react-hook-form FieldError object.
 */
export function FormFieldError({ error }: FormFieldErrorProps) {
  if (!error?.message) return null;
  return <p className="text-xs text-destructive mt-1">{error.message}</p>;
}
