// hooks/useApiErrorToast.ts
import { ApiErrorResponse } from '@/types/api';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

export const useApiErrorToast = () => {
  /**
   * Mostra toast di errore da risposta API
   * @param error - Errore da Axios
   * @param customMessage - Messaggio personalizzato opzionale
   */
  const showErrorToast = (error: unknown, customMessage?: string) => {
    // Gestisci AxiosError
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiErrorResponse;

      // Estrai messaggio principale
      const mainMessage =
        customMessage ||
        data?.message ||
        data?.error?.message ||
        error.message ||
        'Si è verificato un errore';

      // Estrai errori di validazione
      const validationErrors = data?.errors || data?.error?.errors;

      // Se ci sono errori di validazione, mostra il primo con toast.error()
      if (validationErrors && validationErrors.length > 0) {
        const errors = validationErrors
          .map((err) => `${err.field ? `${err.field}: ` : ''}${err.message}`)
          .join('\n');

        toast.error(mainMessage, {
          description: errors,
          duration: 5000,
        });
        return;
      }

      // Altrimenti mostra messaggio generico
      toast.error(mainMessage, {
        duration: 4000,
      });
      return;
    }

    // Gestisci errori generici
    if (error instanceof Error) {
      toast.error(customMessage || error.message, {
        duration: 4000,
      });
      return;
    }

    // Fallback
    toast.error(customMessage || 'Si è verificato un errore sconosciuto', {
      duration: 4000,
    });
  };

  /**
   * Mostra toast di successo
   */
  const showSuccessToast = (message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  };

  /**
   * Mostra toast info
   */
  const showInfoToast = (message: string) => {
    toast.info(message, {
      duration: 3000,
    });
  };

  /**
   * Mostra toast warning
   */
  const showWarningToast = (message: string) => {
    toast.warning(message, {
      duration: 4000,
    });
  };

  return {
    showErrorToast,
    showSuccessToast,
    showInfoToast,
    showWarningToast,
  };
};