import nodemailer from "nodemailer";

// TODO: Check type of to (string | Array<string>)???

export default async function sendMail(
  to: string,
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
