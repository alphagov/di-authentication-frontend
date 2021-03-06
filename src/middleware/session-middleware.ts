import { NextFunction, Request, Response } from "express";
import { ERROR_LOG_LEVEL, ERROR_MESSAGES, PATH_NAMES } from "../app.constants";
import xss from "xss";
import { ErrorWithLevel } from "../utils/error";

export function initialiseSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.path === PATH_NAMES.START) {
    req.session.client = {};

    const email =
      req.session && req.session.user ? req.session.user.email : undefined;
    const phoneNumber =
      req.session && req.session.user
        ? req.session.user.phoneNumber
        : undefined;

    req.session.user = {
      email: email,
      phoneNumber: phoneNumber,
    };
  }

  next();
}

export function getSessionIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.cookies && req.cookies.gs) {
    const ids = xss(req.cookies["gs"]).split(".");

    res.locals.sessionId = ids[0];
    res.locals.clientSessionId = ids[1];
  }
  if (req.cookies && req.cookies["di-persistent-session-id"]) {
    res.locals.persistentSessionId = xss(
      req.cookies["di-persistent-session-id"]
    );
  }
  next();
}

export function validateSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.cookies.gs && req.cookies.aps && req.session.id) {
    return next();
  }

  req.session.destroy((error) => {
    if (error) {
      req.log.error(`Failed to delete session: ${error}`);
    } else {
      req.log.info("Session destroyed");
    }
  });

  res.status(401);
  next(
    new ErrorWithLevel(ERROR_MESSAGES.INVALID_SESSION, ERROR_LOG_LEVEL.INFO)
  );
}
