import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();

export const verifyGoogle = async (token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload: any = ticket.getPayload();
  const userid = payload["sub"];
  return userid;
};
