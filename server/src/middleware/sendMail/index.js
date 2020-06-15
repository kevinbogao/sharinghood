const nodemailer = require('nodemailer');

async function sendMail(to, subject, text, html) {
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sharinghood@gmail.com',
      pass: '6minutes',
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

module.exports = sendMail;
