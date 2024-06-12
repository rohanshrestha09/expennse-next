import * as sdk from "node-appwrite";

const client = new sdk.Client()
  .setEndpoint(process.env.APPWRITE_API_ENDPOINT as string)
  .setProject(process.env.APPWRITE_PROJECT_ID as string)
  .setKey(process.env.APPWRITE_API_KEY as string);

export const account = new sdk.Account(client);

export const accountWithJwt = (jwtToken: string) =>
  new sdk.Account(
    new sdk.Client()
      .setEndpoint(process.env.APPWRITE_API_ENDPOINT as string)
      .setProject(process.env.APPWRITE_PROJECT_ID as string)
      .setJWT(jwtToken),
  );

export const users = new sdk.Users(client);

export const databases = new sdk.Databases(client);

export const storage = new sdk.Storage(client);

export const avatars = new sdk.Avatars(client);
