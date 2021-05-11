import sendMail, { header } from "./index";

type ResetPasswordMailParams = {
  resetLink: string;
  to: string;
  subject: string;
  text?: string;
};

export default async function resetPasswordMail({
  resetLink,
  to,
  subject,
  text = "",
}: ResetPasswordMailParams) {
  const html = `
    <!DOCTYPE html>
    <html>
      ${header}
      <body>
        <img class="logo" src="https://i.imgur.com/gvHSNIu.png" alt="" />
        <h1>Reset your Sharinghood password</h1>
        <p class="subject">
          A password reset has been requested by your Sharinghood account
        </p>
        <a class="btn reset-btn" href="${resetLink}">
          <p class="btn-text">Reset password</p>
        </a>
        <p class="community">
          If you did not request your password to be reset, please ignore this
          email and your password will not be changed.
        </p>
        <div class="separator" />
        </div>
        <div class="footer">
          <p class="footer-text">
            You've received this email because a password reset was requested for
            your account.
          </p>
        </div>
        <p class="footer-text">Contact us any time via: sharinghood@gmail.com</p>
      </body>
    </html>
  `;

  // Get status & return status
  const info = await sendMail({ to, subject, text, html });

  return info;
}
