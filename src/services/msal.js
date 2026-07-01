import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || "781dd721-a1e4-4fab-97ea-3c47d00a6509",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || "17dcec91-66ec-4c4b-a988-473694df546c"}`,
    redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI || "http://localhost:5173",
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"]
};
