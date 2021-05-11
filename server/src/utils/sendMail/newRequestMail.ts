import sendMail, { header } from "./index";
import generateFooter from "./generateFooter";

type Recipient = {
  _id: string;
  email: string;
};

type RequestMailParams = {
  userName: string;
  itemName: string;
  itemImageUrl: string;
  itemUrl: string;
  dateNeed?: string;
  recipients: Array<Recipient>;
  subject: string;
  text: string;
};

export default async function newRequestMail({
  userName,
  itemName,
  itemImageUrl,
  itemUrl,
  dateNeed,
  recipients,
  subject,
  text = "",
}: RequestMailParams) {
  const needBy = `<h3 class="orange">Needed by: ${dateNeed}</h3>`;

  // Generate footers for each recipient and send mail
  recipients.forEach(async (recipient) => {
    const footer = await generateFooter(recipient._id);

    const html = `
      <!DOCTYPE html>
      <html>
        ${header}
        <body>
          <img class="logo" src="https://i.imgur.com/jaPY6qM.png" alt="logo" />
          <h1>New request in your community!</h1>
          <p class="subject">
            ${userName} from your community is looking for <span> ${itemName}!</span>
          </p>
          <img class="item" src="${itemImageUrl}" alt="Requested item" />
          ${dateNeed ? needBy : "<p></p>"}
          <a class="btn" href="${itemUrl}">
            <p class="btn-text">Upload your item now!</p>
          </a>
          <p class="community">
            This is a closed community. only members of your community can see and
            borrow your items.
          </p>
          ${footer}
        </body>
      </html>
    `;

    const info = await sendMail({ to: recipient.email, subject, text, html });
    return info;
  });
}
