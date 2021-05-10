import nodemailer from "nodemailer";

export default async function sendMail(
  to: string | Array<string>,
  subject: string,
  text: string,
  html?: string
) {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD,
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

const token = "123";

export const footer = `
  <div class="separator" />
  </div>
  <div class="footer">
    <a class="footer-text" href="${process.env.ORIGIN}/unsubscribe/${token}"
      >Unsubscribe
    </a>
    <p class="dot">·</p>
    <a class="footer-text" href="${process.env.ORIGIN}/login">
      Sign in to sharinghood
    </a>
  </div>
  <p class="footer-text">Contact us any time via: sharinghood@gmail.com</p>
`;
