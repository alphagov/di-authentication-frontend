export interface SignInOrCreateServiceInterface {
  clientInfo: (
    sessionId: string,
    clientSessionId: string
  ) => Promise<ClientInfoResponse>;
}

export interface ClientInfoResponse {
  clientId: string;
  clientName: string;
  scopes: string[];
  redirectUri: string;
  service_type: string;
}