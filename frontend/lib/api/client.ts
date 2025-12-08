// lib/api/client.ts

import axios from 'axios';
import { toast } from 'sonner';

// =================================================================
// 1. Configurazione Base dell'Istanza Axios
// =================================================================
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =================================================================
// 2. Interceptor per la Gestione Globale di Errori
// =================================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response || {};

    // Gestione errori comuni
    switch (status) {
      case 400:
        // Bad Request - validazione
        if (data?.errors && data.errors.length > 0) {
          const errorsList = data.errors
            .map((err: any) => `${err.field ? `${err.field}: ` : ''}${err.message}`)
            .join('\n');

          toast.error(data.message || 'Errore di validazione', {
            description: errorsList,
            duration: 5000,
          });
        } else {
          toast.error(data?.message || 'Richiesta non valida', {
            duration: 4000,
          });
        }
        break;

      case 401:
        // Unauthorized - ma NON fare redirect se siamo già sulla pagina di login
        if (typeof window !== 'undefined') {
          const isLoginPage = window.location.pathname === '/login';
          
          if (isLoginPage) {
            // Siamo sulla pagina di login, mostra solo l'errore senza redirect
            toast.error('Credenziali non valide', {
              description: data?.message || 'Email o password errati',
              duration: 4000,
            });
          } else {
            // Non siamo sulla pagina di login, probabilmente token scaduto
            toast.error('Sessione scaduta', {
              description: 'Per favore effettua di nuovo il login',
              duration: 4000,
            });
            window.location.href = '/login';
          }
        }
        break;

      case 403:
        toast.error('Accesso negato', {
          description: 'Non hai i permessi per questa azione',
          duration: 4000,
        });
        break;

      case 404:
        toast.error('Risorsa non trovata', {
          duration: 3000,
        });
        break;

      case 422:
        // Validation Error
        if (data?.errors && data.errors.length > 0) {
          const errorsList = data.errors
            .map((err: any) => `${err.field ? `${err.field}: ` : ''}${err.message}`)
            .join('\n');

          toast.error(data.message || 'Errore di validazione', {
            description: errorsList,
            duration: 5000,
          });
        } else {
          toast.error(data?.message || 'Errore di validazione', {
            duration: 4000,
          });
        }
        break;

      case 409:
        toast.error('Conflitto', {
          description: data?.message || 'Questa risorsa già esiste',
          duration: 4000,
        });
        break;

      case 500:
        toast.error('Errore interno del server', {
          description: 'Per favore riprova più tardi',
          duration: 4000,
        });
        break;

      default:
        toast.error(
          data?.message || error.message || 'Si è verificato un errore'
        );
    }

    return Promise.reject(error);
  }
);

export default api;