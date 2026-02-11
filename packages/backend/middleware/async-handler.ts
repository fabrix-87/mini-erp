/**
 * // middleware/async-handler.ts
 * Wrapper per gestire automaticamente gli errori async
 * Elimina il bisogno di try-catch in ogni controller
 */

import { Request, Response, NextFunction } from "express";

type AsyncHandler<T extends Request = Request> = (
  req: T,
  res: Response,
  next: NextFunction,
) => Promise<void>;

const asyncHandler = <T extends Request = Request>(fn: AsyncHandler<T>) => {
  return (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
