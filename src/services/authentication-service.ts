import { API_ENDPOINTS } from "../app.constants";
import { http } from "../utils/http";
import { User } from "./types/user";
import { UserSignupCredentials } from "./types/user-signup-credentials";

export async function userExists(sessionId: string, emailAddress: string): Promise<boolean> {
  const config = {
    headers: {
      "Session-Id": sessionId,
    },
  };
  const { data } = await http.client.post<User>(API_ENDPOINTS.USER_EXISTS, {
    email: emailAddress,
  }, config);

  return data.doesUserExist;
}

export async function signUpUser(
  sessionId: string,
  emailAddress: string,
  password: string
): Promise<boolean> {
  const config = {
    headers: {
      "Session-Id": sessionId,
    },
  };
  const { data } = await http.client.post<UserSignupCredentials>(
    API_ENDPOINTS.SIGNUP_USER,
    {
      email: emailAddress,
      password: password,
    }
    , config);
  return true;
}