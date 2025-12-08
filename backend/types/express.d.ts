declare global {
  namespace Express {
    interface Request {
      validatedQuery?: any;
      validatedParams?: any;
    }
  }
}

export {};