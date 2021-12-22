import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import {
  resetPassword,
  updateBooking,
  createRequest,
  createAccount,
  createCommunity,
  ResetPasswordArgs,
  UpdateBookingArgs,
  CreateRequestArgs,
  CreateAccountArgs,
  CreateCommunityArgs,
} from "./templates";

interface SendMailParams {
  to: string;
  subject: string;
}

interface Mail {
  resetPassword: ResetPasswordArgs;
  updateBooking: UpdateBookingArgs;
  createRequest: CreateRequestArgs;
  createAccount: CreateAccountArgs;
  createCommunity: CreateCommunityArgs;
}

const MAIL_TEMPLATES: Record<keyof Mail, Function> = {
  resetPassword,
  updateBooking,
  createRequest,
  createAccount,
  createCommunity,
};

const oAuth2Client = new OAuth2Client(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN });

export default async function sendMail<K extends keyof Mail>(
  type: K,
  args: Mail[K],
  { to, subject }: SendMailParams
) {
  if (process.env.NODE_ENV === "production") return;
  const accessToken = await oAuth2Client.getAccessToken();
  const html = <string>await MAIL_TEMPLATES[type](args);

  const transport = nodemailer.createTransport({
    // @ts-ignore
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_USERNAME,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      accessToken,
    },
  });

  const info = await transport.sendMail({
    from: '"Sharinghood" <sharinghood@gmail.com>',
    to,
    subject,
    html,
  });

  return info;
}
