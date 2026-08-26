import {
  Account,
  Client,
  Databases,
  Functions,
  OAuthProvider,
  Storage,
} from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

/**
 * Shared Appwrite browser client.
 *
 * Add NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID to
 * .env.local before calling an Appwrite service.
 */
export const client = new Client();

export const isAppwriteConfigured = Boolean(endpoint && projectId);

if (isAppwriteConfigured) {
  client.setEndpoint(endpoint!).setProject(projectId!);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export function requireAppwriteConfiguration() {
  if (!isAppwriteConfigured) {
    throw new Error(
      "Appwrite is not configured. Set NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID in .env.local.",
    );
  }
}

export function signInWithGoogle(success: string, failure: string) {
  requireAppwriteConfiguration();

  return account.createOAuth2Session({
    provider: OAuthProvider.Google,
    success,
    failure,
  });
}
