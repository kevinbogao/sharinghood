import sendMail, { header, footer } from "./index";

interface CommunityMailParams {
  communityUrl: string;
  to: string | Array<string>;
  subject: string;
  text?: string;
}

export default async function newCommunityMail({
  communityUrl,
  to,
  subject,
  text = "",
}: CommunityMailParams) {
  const html = `
    <!DOCTYPE html>
    <html>
      <body>
        ${header}
        <div class="header-bg">
          <p class="header-img-font-lg">Wilkommen!</p>
          <br />
          <p class="header-img-font-sm">
            Congrats, you have successfully created your Sharinghood Community!
          </p>
        </div>
        <h2 class="blue">You are a hero already!</h2>
        <h2 class="orange">
          Here are some tips on how to invite your neighbours!
        </h2>
        <h3 class="blue">
          TIP1: <span class="orange">Print out your invitation PDF!</span>
        </h3>
        <h5 class="black">
          Put one in the hallway, or print several and hand them out to the
          mailboxes.
        </h5>
        <h3 class="blue">
          TIP2:
          <span class="orange">
            Create your own QR Code with your link.</span
          >
        </h3>
        <h5 class="instruction black">
          <strong>1. Copy </strong> your link down below.
          <p class="link">${communityUrl}</p>
        </h5>
        <h5 class="instruction black">
          <strong>2. Paste </strong> it in a QR Code generator (You can find
          several).
        </h5>
        <h5 class="instruction black">
          <strong>3. Screenshot </strong> it or download if free.
        </h5>
        <h5 class="instruction black">
          <strong>4. Add </strong> it on your PDF.
        </h5>
        <h4 class="orange tip">
          Make sure to include the link / or the code to your community!
        </h4>
        <h4 class="blue tip">
          Didn’t save it? You can find your link in your community!
        </h4>
        <br />
        <h3 class="blue">
          TIP3:
          <span class="orange"> Leave a personal contact information.</span>
        </h3>
        <h5 class="black">
          If you believe that neighbours keep considering your invitation spam,
          why not leave your personal email / number and offer your help!
        </h5>
        <h2 class="orange">Have fun, the Sharinghood Team</h2>
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
