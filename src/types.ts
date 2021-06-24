import { ValidationChain } from "express-validator";

export interface UserSession {
  id: string;
  scope: string;
  email?: string;
}

import express, { NextFunction, Request, Response } from "express";

export type ExpressRouteFunc = (
  req: Request,
  res: Response,
  next?: NextFunction
) => void | Promise<void>;

export type ValidationChainFunc = (
  | ValidationChain
  | ((
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => any)
)[];
