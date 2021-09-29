import { Request, Response } from "express";
import { PATH_NAMES, USER_STATE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { enterPasswordService } from "./enter-password-service";
import { EnterPasswordServiceInterface } from "./types";
import { MfaServiceInterface } from "../common/mfa/types";
import { mfaService } from "../common/mfa/mfa-service";

const ENTER_PASSWORD_TEMPLATE = "enter-password/index.njk";
const ENTER_PASSWORD_VALIDATION_KEY =
  "pages.enterPassword.password.validationError.incorrectPassword";

const ENTER_PASSWORD_ACCOUNT_EXISTS_TEMPLATE =
  "enter-password/index-account-exists.njk";
const ENTER_PASSWORD_ACCOUNT_EXISTS_VALIDATION_KEY =
  "pages.enterPasswordAccountExists.password.validationError.incorrectPassword";

export function enterPasswordGet(req: Request, res: Response): void {
  res.render(ENTER_PASSWORD_TEMPLATE);
}

export function enterPasswordAccountLockedGet(
  req: Request,
  res: Response
): void {
  res.render("enter-password/index-account-locked.njk");
}

export function enterPasswordAccountExistsGet(
  req: Request,
  res: Response
): void {
  const { email } = req.session.user;
  res.render(ENTER_PASSWORD_ACCOUNT_EXISTS_TEMPLATE, {
    email: email,
  });
}

export function enterPasswordPost(
  fromAccountExists = false,
  service: EnterPasswordServiceInterface = enterPasswordService(),
  mfaCodeService: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId } = res.locals;

    const userLogin = await service.loginUser(
      sessionId,
      email,
      req.body["password"],
      clientSessionId,
      req.ip
    );

    if (userLogin.sessionState === USER_STATE.ACCOUNT_LOCKED) {
      return res.redirect(PATH_NAMES.ACCOUNT_LOCKED);
    }

    if (userLogin.sessionState === USER_STATE.REQUIRES_TWO_FACTOR) {
      return res.redirect(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
    }

    if (userLogin.sessionState === USER_STATE.LOGGED_IN) {
      req.session.user.phoneNumber = userLogin.redactedPhoneNumber;
      await mfaCodeService.sendMfaCode(sessionId, email, req.ip);
      return res.redirect(PATH_NAMES.ENTER_MFA);
    }

    //VTR Cm
    if (userLogin.sessionState === USER_STATE.AUTHENTICATED) {
      return res.redirect(PATH_NAMES.AUTH_CODE);
    }

    const error = formatValidationError(
      "password",
      req.t(
        fromAccountExists
          ? ENTER_PASSWORD_ACCOUNT_EXISTS_VALIDATION_KEY
          : ENTER_PASSWORD_VALIDATION_KEY
      )
    );

    return renderBadRequest(
      res,
      req,
      fromAccountExists
        ? ENTER_PASSWORD_ACCOUNT_EXISTS_TEMPLATE
        : ENTER_PASSWORD_TEMPLATE,
      error
    );
  };
}
