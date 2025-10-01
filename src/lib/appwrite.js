import { Client, Account, Databases, ID, Query, Permission, Role } from "appwrite";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const MESSAGES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID;
const ONLINE_USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ONLINE_USERS_COLLECTION_ID;

export {
  client,
  account,
  databases,
  ID,
  Query,
  Permission,
  Role,
  DATABASE_ID,
  MESSAGES_COLLECTION_ID,
  ONLINE_USERS_COLLECTION_ID,
};
