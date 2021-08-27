import sendMail, { header } from "./index";
import generateFooter from "./generateFooter";

type UpdateBookingMailParams = {
  bookingsUrl: string;
  recipientId: string;
  to: string;
  subject: string;
  text?: string;
};

export default async function updateBookingMail({
  bookingsUrl,
  recipientId,
  to,
  subject,
  text = "",
}: UpdateBookingMailParams) {
  const footer = await generateFooter(recipientId);

  const html = `
    <!DOCTYPE html>
    <html>
      ${header}
      <body>
        <img class="logo" src="https://i.imgur.com/gvHSNIu.png" alt="logo" />
        <h1>You have a new notification</h1>
        <p class="subject">${subject}</p>
        <img class="bell" src="https://i.imgur.com/Z2j7440.png" alt="" />
        <a class="btn booking-btn" href="${bookingsUrl}">
          <p class="btn-text">View my bookings</p>
        </a>
        ${footer}
      </body>
    </html>
  `;

  // Get status & return status
  const info = await sendMail({ to, subject, text, html });

  return info;
}
