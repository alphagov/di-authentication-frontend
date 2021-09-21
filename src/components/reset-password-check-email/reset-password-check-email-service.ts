import { getBaseRequestConfig, Http, http } from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";

import { ResetPasswordCheckEmailServiceInterface } from "./types";
import { ApiResponse, ApiResponseResult } from "../../types";

export function resetPasswordCheckEmailService(
  axios: Http = http
): ResetPasswordCheckEmailServiceInterface {
  const resetPasswordRequest = async function (
    email: string,
    sessionId: string
  ): Promise<ApiResponseResult> {
    const config = getBaseRequestConfig(sessionId);
    config.validateStatus = function (status: number) {
      return (
        status === HTTP_STATUS_CODES.OK ||
        status === HTTP_STATUS_CODES.BAD_REQUEST
      );
    };
    const { data, status } = await axios.client.post<ApiResponse>(
      API_ENDPOINTS.RESET_PASSWORD_REQUEST,
      {
        email: email,
      },
      config
    );
    return {
      success: status === HTTP_STATUS_CODES.OK,
      sessionState: data.sessionState,
      code: data.code,
      message: data.message,
    };
  };
  return {
    resetPasswordRequest,
  };
}
