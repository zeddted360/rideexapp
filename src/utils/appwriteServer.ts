// src/utils/appwriteServer.ts
import {
  Client,
  Databases,
  Users,
  Storage,
  Messaging,
  ID,
} from "node-appwrite";

interface ServerEnvConfig {
  endpoint: string;
  projectId: string;
  apiKey: string;
  databaseId: string;
  vendorsCollectionId: string;
  userCollectionId: string;
}

// Validate only the required server-side environment variables
export function validateServerEnv(): ServerEnvConfig {
  const requiredEnvVars: Partial<ServerEnvConfig> = {
    apiKey: process.env.APPWRITE_API_KEY,
    endpoint: process.env.APPWRITE_ENDPOINT,
    projectId: process.env.APPWRITE_PROJECT_ID,
    databaseId: process.env.APPWRITE_DATABASE_ID,
    vendorsCollectionId: process.env.APPWRITE_VENDORS_COLLECTION_ID,
    userCollectionId: process.env.APPWRITE_USERS_COLLECTION_ID,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => value === undefined)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error("Missing server environment variables:", missingVars);
    throw new Error(
      `Missing required server environment variables: ${missingVars.join(", ")}`
    );
  }

  return requiredEnvVars as ServerEnvConfig;
}

// Initialize once (shared across requests)
const env = validateServerEnv();

const client = new Client()
  .setEndpoint(env.endpoint)
  .setProject(env.projectId)
  .setKey(env.apiKey);

export const databases = new Databases(client);
export const users = new Users(client);
export const storage = new Storage(client);
export const messaging = new Messaging(client);

export { client, ID };

// Only includes what's needed for current server routes (vendor/user deletion)
export const serverConfig = {
  databaseId: env.databaseId,
  vendorsCollectionId: env.vendorsCollectionId,
  userCollectionId: env.userCollectionId,
};
