import { PATH_NAMES, USER_STATE } from "../../app.constants";

const OTP_ERROR_MAPPING: { [p: string]: string } = {
  [USER_STATE.MFA_SMS_MAX_CODES_SENT]:
    PATH_NAMES["SECURITY_CODE_REQUEST_EXCEEDED"],
  [USER_STATE.MFA_CODE_REQUESTS_BLOCKED]: PATH_NAMES["SECURITY_CODE_WAIT"],
  [USER_STATE.EMAIL_MAX_CODES_SENT]:
    PATH_NAMES["SECURITY_CODE_REQUEST_EXCEEDED"],
  [USER_STATE.EMAIL_CODE_REQUESTS_BLOCKED]: PATH_NAMES["SECURITY_CODE_WAIT"],
  [USER_STATE.PHONE_NUMBER_MAX_CODES_SENT]:
    PATH_NAMES["SECURITY_CODE_REQUEST_EXCEEDED"],
  [USER_STATE.PHONE_NUMBER_CODE_REQUESTS_BLOCKED]:
    PATH_NAMES["SECURITY_CODE_WAIT"],
  [USER_STATE.EMAIL_CODE_MAX_RETRIES_REACHED]:
    PATH_NAMES["SECURITY_CODE_INVALID"],
  [USER_STATE.PHONE_NUMBER_CODE_MAX_RETRIES_REACHED]:
    PATH_NAMES["SECURITY_CODE_INVALID"],
  [USER_STATE.MFA_CODE_MAX_RETRIES_REACHED]:
    PATH_NAMES["SECURITY_CODE_INVALID"],
};

export function getNextPathRateLimit(sessionState: string): string {
  return OTP_ERROR_MAPPING[sessionState];
}