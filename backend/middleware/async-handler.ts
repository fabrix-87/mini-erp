/**
 * Wrapper per gestire automaticamente gli errori async
 * Elimina il bisogno di try-catch in ogni controller
 */

import { Request, Response, NextFunction } from "express";

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;