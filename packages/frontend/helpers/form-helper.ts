import { toast } from 'sonner';

// Funzione ricorsiva per trovare e mostrare tutti i messaggi d'errore
export const displayFormErrors = (errorObject: any) => {
  if (!errorObject) return;

  // Se l'oggetto ha direttamente la proprietà 'message', abbiamo trovato l'errore!
  if (errorObject.message) {
    toast.error(errorObject.message);
    return;
  }

  // Altrimenti, continuiamo a scorrere le proprietà dell'oggetto (o dell'array)
  Object.keys(errorObject).forEach((key) => {
    displayFormErrors(errorObject[key]);
  });
};

/**
 * Normalizes optional form field values for controlled text inputs.
 * @param value - Value coming from React Hook Form.
 * @returns A string suitable for an HTML input value.
 */
export function toInputValue(value:unknown): string {
  return typeof value === "string" ? value : "";
}