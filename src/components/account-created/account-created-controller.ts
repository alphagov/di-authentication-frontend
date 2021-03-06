import { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

export function accountCreatedGet(req: Request, res: Response): void {
  const { serviceType, name } = req.session.client;

  res.render("account-created/index.njk", {
    serviceType,
    name,
  });
}

export function accountCreatedPost(req: Request, res: Response): void {
  const nextPath = getNextPathAndUpdateJourney(
    req,
    req.path,
    USER_JOURNEY_EVENTS.ACCOUNT_CREATED,
    {
      isConsentRequired: req.session.user.isConsentRequired,
    },
    res.locals.sessionId
  );

  res.redirect(nextPath);
}
