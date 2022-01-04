function generateFooter(recipientId: string, unsubscribeToken: string): string {
  return `
    <div class="separator" />
    </div>
    <div class="footer">
      <a class="footer-text" href="${process.env.ORIGIN}/account/unsubscribe?id=${recipientId}&to=${unsubscribeToken}"
        >Unsubscribe
      </a>
      <p class="dot">·</p>
      <a class="footer-text" href="${process.env.ORIGIN}/login">
        Sign in to sharinghood
      </a>
    </div>
    <p class="footer-text">Contact us any time via: sharinghood@gmail.com</p>
  `;
}

interface FooterArgs {
  recipientId: string;
  unsubscribeToken: string;
}

export interface CreateAccountArgs extends FooterArgs {
  confirmationUrl: string;
  communityName: string;
}

export function createAccount({
  recipientId,
  communityName,
  confirmationUrl,
  unsubscribeToken,
}: CreateAccountArgs): string {
  const footer = generateFooter(recipientId, unsubscribeToken);

  return `
    <!DOCTYPE html>
    <html>
      ${HEADER}
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
}

export interface CreateCommunityArgs extends FooterArgs {
  communityUrl: string;
}

export function createCommunity({
  communityUrl,
  recipientId,
  unsubscribeToken,
}: CreateCommunityArgs): string {
  const footer = generateFooter(recipientId, unsubscribeToken);

  return `
    <!DOCTYPE html>
    <html>
      <body>
        ${HEADER}
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
          why not leave your personal recipientId / number and offer your help!
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
}

export interface ResetPasswordArgs {
  resetLink: string;
}

export function resetPassword({ resetLink }: ResetPasswordArgs): string {
  return `
    <!DOCTYPE html>
    <html>
      ${HEADER}
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
          recipientId and your password will not be changed.
        </p>
        <div class="separator" />
        </div>
        <div class="footer">
          <p class="footer-text">
            You've received this recipientId because a password reset was requested for
            your account.
          </p>
        </div>
        <p class="footer-text">Contact us any time via: sharinghood@gmail.com</p>
      </body>
    </html>
  `;
}

export interface UpdateBookingArgs extends FooterArgs {
  notificationUrl: string;
  subject: string;
}

export function updateBooking({
  notificationUrl,
  subject,
  recipientId,
  unsubscribeToken,
}: UpdateBookingArgs) {
  const footer = generateFooter(recipientId, unsubscribeToken);

  return `
    <!DOCTYPE html>
    <html>
      ${HEADER}
      <body>
        <img class="logo" src="https://i.imgur.com/gvHSNIu.png" alt="logo" />
        <h1>You have a new notification</h1>
        <p class="subject">${subject}</p>
        <img class="bell" src="https://i.imgur.com/Z2j7440.png" alt="" />
        <a class="btn booking-btn" href="${notificationUrl}">
          <p class="btn-text">View my bookings</p>
        </a>
        ${footer}
      </body>
    </html>
  `;
}

export interface CreateRequestArgs extends FooterArgs {
  userName: string;
  itemName: string;
  itemImageUrl: string;
  itemUrl: string;
  dateNeed?: string;
}

export function createRequest({
  userName,
  itemName,
  itemUrl,
  itemImageUrl,
  dateNeed,
  recipientId,
  unsubscribeToken,
}: CreateRequestArgs): string {
  const footer = generateFooter(recipientId, unsubscribeToken);
  const needBy = `<h3 class="orange">Needed by: ${dateNeed}</h3>`;

  return `
    <!DOCTYPE html>
    <html>
      ${HEADER}
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
}

const HEADER = `
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
