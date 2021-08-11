import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { getApiBaseUrl } from "../config";
import Logger, { getLogLabel } from "./logger";

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

const headers: Readonly<Record<string, string | boolean>> = {
  Accept: "application/json",
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Credentials": true,
  "X-Requested-With": "XMLHttpRequest",
};

export function getBaseRequestConfig(sessionId: string): AxiosRequestConfig {
  return {
    headers: {
      "Session-Id": sessionId,
    },
    proxy: false,
  };
}

export function getBaseRequestConfigWithClientSession(sessionId: string, clientSessionId: string): AxiosRequestConfig {
  return {
    headers: {
      "Session-Id": sessionId,
      "Client-Session-Id": clientSessionId,
    },
    proxy: false,
  };
}

export class Http {
  private instance: AxiosInstance;

  get client(): AxiosInstance {
    return this.instance || this.initHttp();
  }

  private handleError(error: AxiosError) {
    const { response } = error;
    const { data } = response;

    if (data) {
      logger.error(error.message, logLabel, { error: JSON.stringify(data) });
    } else {
      logger.error(error.message, logLabel);
    }

    return Promise.reject(error);
  }

  private injectCustomHeaders(config: AxiosRequestConfig): AxiosRequestConfig {
    //TODO basic auth for api
    return config;
  }

  private initHttp() {
    const http = axios.create({
      baseURL: getApiBaseUrl(),
      headers: headers,
    });

    http.interceptors.request.use(this.injectCustomHeaders, (error) =>
      Promise.reject(error)
    );

    http.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );

    this.instance = http;
    return http;
  }
}
export const http = new Http();
