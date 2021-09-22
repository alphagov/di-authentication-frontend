import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { PATH_NAMES } from "../../app.constants";
import { ResetPasswordServiceInterface } from "./types";
import { resetPasswordService } from "./reset-password-service";

function isCodeExpired(code: string): boolean {
  const codeExpiry = code.split(".")[1];
  return Date.now() > Number(codeExpiry);
}

function getCode(code: string): string {
  return code.split(".")[0];
}

export function resetPasswordGet(req: Request, res: Response): void {
  const code = req.query.code as string;

  if (!req.query.code || isCodeExpired(code)) {
    return res.render("reset-password/index-invalid.njk");
  }

  res.render("reset-password/index.njk", { code: code });
}

export function resetPasswordPost(
  service: ResetPasswordServiceInterface = resetPasswordService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const code = req.body.code;
    const newPassword = req.body.password;

    if (isCodeExpired(code)) {
      return res.redirect(PATH_NAMES.RESET_PASSWORD_EXPIRED_LINK);
    }

    const response = await service.updatePassword(newPassword, getCode(code));

    if (response.success) {
      return res.redirect(PATH_NAMES.RESET_PASSWORD_CONFIRMATION);
    }

    return res.redirect(PATH_NAMES.RESET_PASSWORD_EXPIRED_LINK);
  };
}

export function resetPasswordConfirmationGet(
  req: Request,
  res: Response
): void {
  res.render("reset-password/index-confirmation.njk");
}

export function resetPasswordExpiredLinkGet(req: Request, res: Response): void {
  res.render("reset-password/index-expired.njk");
}