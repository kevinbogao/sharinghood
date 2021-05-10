import sendMail, { header, footer } from "./index";

interface AccountMailParams {
  confirmationUrl: string;
  communityName: string;
  to: string | Array<string>;
  subject: string;
  text?: string;
}

export default async function newAccountMail({
  confirmationUrl,
  communityName,
  to,
  subject,
  text = "",
}: AccountMailParams) {
  const html = `
    <!DOCTYPE html>
    <html>
      ${header}
      <body>
        <div class="header-bg">
          <p class="header-img-font-lg">Wilkommen!</p>
          <br />
          <p class="header-img-font-sm">
            You are now a new member of the ${communityName} sharing community!
          </p>
        </div>
        <h2 class="blue">You are a hero already!</h2>
        <h2 class="orange">How to use the platform?</h2>
        <h5 class="black">
          Whenever you need something that you don’t own yet. Simply request it
          from your neighbours and borrow it for the time needed!
        </h5>
        <h4 class="blue">
          Start by making your items available to the community!
        </h4>
        <h2 class="orange">Why should I share at all?</h2>
        <h5 class="black">
          Did you know that 80% of our owned items is only used once per month.
          Living in clutter of items we do not use can be stressful. Instead of
          owning everything, why not own the essentials and borrow the rest. The
          goal of this platform is to make all the available items visible to
          your members so they can be requested at any time!
        </h5>
        <h2 class="orange">
          Examples of other communities:
          <span class="blue block">
            books, drill set, ladder, special kitchen tools...
          </span>
        </h2>
        <a class="btn" href="${confirmationUrl}">
          <p class="btn-text">Share now!</p>
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
