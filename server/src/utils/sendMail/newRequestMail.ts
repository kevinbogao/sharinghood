import sendMail, { header, footer } from "./index";

type RequestMailParams = {
  userName: string;
  itemName: string;
  itemImageUrl: string;
  itemUrl: string;
  dateNeed?: string;
  to: string | Array<string>;
  subject: string;
  text: string;
};

export default async function newRequestMail({
  userName,
  itemName,
  itemImageUrl,
  itemUrl,
  to,
  subject,
  text = "",
  dateNeed,
}: RequestMailParams) {
  const needBy = `<h3 class="orange">Needed by: ${dateNeed}</h3>`;

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

  // Get status & return status
  const info = await sendMail(to, subject, text, html);

  return info;
}
