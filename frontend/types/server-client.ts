// types/server-client.ts

/**
 * Opzioni per le richieste server-side
 */
export interface ServerRequestOptions extends RequestInit {
  /** Query parameters */
  params?: Record<string, any>;
  
  /** Include cookies nelle richieste (default: true) */
  includeCookies?: boolean;
  
  /** Next.js revalidation time in seconds */
  revalidate?: number | false;
  
  /** Next.js cache tags */
  tags?: string[];

  responseType?: string;
  data?: any;
}

/**
 * Errore API server-side
 */
export class ServerApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ServerApiError';
  }
}
