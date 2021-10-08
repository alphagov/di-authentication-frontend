import { Request, Response } from "express";
import { NOTIFICATION_TYPE, PATH_NAMES, USER_STATE } from "../../app.constants";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { ExpressRouteFunc } from "../../types";
import { getNextPathByState } from "../common/constants";

const TEMPLATE_NAME = "check-your-phone/index.njk";

export function checkYourPhoneGet(req: Request, res: Response): void {
  res.render(TEMPLATE_NAME, {
    phoneNumber: req.session.phoneNumber,
  });
}

export const checkYourPhonePost = (
  service: VerifyCodeInterface = codeService()
): ExpressRouteFunc => {
  return verifyCodePost(service, {
    notificationType: NOTIFICATION_TYPE.VERIFY_PHONE_NUMBER,
    template: TEMPLATE_NAME,
    validationKey: "pages.checkYourPhone.code.validationError.invalidCode",
    validationState: USER_STATE.PHONE_NUMBER_CODE_NOT_VALID,
    callback: (req, res, state) => {
      req.session.backState = state;
      if (state === USER_STATE.CONSENT_REQUIRED) {
        req.session.nextState = state;
        return res.redirect(PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL);
      }
      res.redirect(getNextPathByState(state));
    },
  });
};
