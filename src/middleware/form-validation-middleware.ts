import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { renderBadRequest } from "../utils/validation";

export const validationErrorFormatter = ({
  msg,
  param,
}: {
  msg: string;
  param: string;
}): any => {
  return {
    text: msg,
    href: `#${param}`,
  };
};

export function validateBodyMiddleware(template: string) {
  return (req: Request, res: Response, next: NextFunction): any => {
    const errors = validationResult(req)
      .formatWith(validationErrorFormatter)
      .mapped();

    if (Object.keys(errors).length !== 0) {
      return renderBadRequest(res, req, template, errors);
    }
    next();
  };
}
