export interface ServerRequestOptions extends RequestInit {
  params?: Record<string, any>;
  includeCookies?: boolean;
  revalidate?: number | false;
  tags?: string[];
}

export class ServerApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ServerApiError';
  }
}
