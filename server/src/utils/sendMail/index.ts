import nodemailer from "nodemailer";
import { google } from "googleapis";

type SendMailParams = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const oAuth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH_TOKEN,
});

export default async function sendMail({
  to,
  subject,
  text,
  html,
}: SendMailParams) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

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
      text,
      html,
    });

    return info;
  } catch (err) {
    console.log(err);
    return;
  }
}

export const header = `
  <head>
    <style>
      * {
        font-family: "Karla", -apple-system, BlinkMacSystemFont, Segoe UI,
          Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans,
          Helvetica Neue, sans-serif;
        text-decoration: none;
      }

      body {
        width: 70%;
        margin: 50px auto 20px auto;
      }

      .orange {
        color: #ff9635;
      }

      .blue {
        color: #3f3d56;
      }

      .black {
        color: black;
      }

      .header-img-font-lg {
        color: #fff;
        font-size: 42px;
        font-weight: bold;
        text-align: center;
        margin: 0;
      }

      .header-img-font-sm {
        color: #fff;
        font-size: 28px;
        font-weight: bold;
        text-align: center;
        margin: 0;
      }

      .header-bg {
        padding: 60px 20px;
        background: url("https://i.imgur.com/8OkZW8S.png");
        background-repeat: no-repeat;
        background-size: cover;
        margin-bottom: 50px;
      }

      h1 {
        color: #ff9635;
        font-weight: 800;
        font-size: 35px;
        margin: 20px auto;
      }

      h2 {
        font-weight: 800;
        font-size: 32px;
        margin: 20px auto;
        text-align: center;
      }

      h3 {
        display: block;
        font-size: 24px;
        margin: 0px auto 20px auto;
        text-align: center;
      }

      h4 {
        font-weight: 700;
        font-size: 22px;
        text-align: center;
      }

      h5 {
        font-weight: 400;
        font-size: 19px;
        text-align: center;
      }

      a {
        cursor: pointer;
      }

      span {
        font-weight: 700;
      }

      .tip {
        margin: 10px auto;
      }

      .subject {
        color: black;
        font-size: 24px;
        font-weight: 400;
        font-style: italic;
        margin: 0 auto;
      }

      .link {
        margin: 10px auto;
        font-style: italic;
        text-decoration: underline;
      }

      .instruction {
        margin: 16px auto;
      }

      .block {
        display: block;
        margin: auto auto 40px auto;
      }

      .logo {
        width: 60px;
        margin-left: 3px;
        object-fit: contain;
      }

      .item {
        display: block;
        margin: 50px auto;
        width: 320px;
        max-width: 80%;
        max-height: 270px;
        object-fit: contain;
      }

      .bell {
        display: block;
        margin: 50px auto 60px auto;
        max-width: 130px;
        object-fit: contain;
      }

      .btn {
        display: flex;
        cursor: pointer;
        max-width: 100%;
        border-style: none;
        text-align: center;
        text-decoration: none;
      }

      .booking-btn {
        margin-bottom: 50px;
      }

      .reset-btn {
        margin: 50px auto;
      }

      .btn-text {
        max-width: 65%;
        margin: auto;
        padding: 15px 20px;
        color: white;
        background-color: #ff9635;
        font-size: 20px;
        font-weight: 700;
        border-radius: 17px;
      }

      .community {
        color: black;
        font-size: 13px;
        font-weight: 200;
        text-align: center;
        margin: 30px;
      }

      .separator {
        width: 100%;
        height: 2px;
        background-color: #e9e9e9;
      }

      .footer {
        margin: 20px auto 0px auto;
        text-align: left;
        font-weight: 400;
      }

      .footer-text {
        color: black;
        margin: 7px auto;
        font-size: 13px;
        text-decoration: none;
      }

      .dot {
        display: inline;
        font-size: 13px;
      }
    </style>
    <link
      href="https://fonts.googleapis.com/css?family=Karla&display=swap"
      rel="stylesheet"
    />
  </head>
`;
