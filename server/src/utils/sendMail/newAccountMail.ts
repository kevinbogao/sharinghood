import sendMail from "./index";

export default async function newAccountMail(
  confirmationUrl: string,
  communityName: string,
  to: string,
  subject: string,
  text: string = ""
) {
  const html = `
    <!DOCTYPE html>
    <html style="margin: 0; padding: 0;">
      <body style="margin-left: 15%; margin-right: 15%;">
        <div
          style="
          width: 100%;
          height: 200px;
          padding-top: 60px;
          background: url('https://i.imgur.com/8OkZW8S.png');
          background-repeat: no-repeat;
          background-size: cover;
        "
        >
          <div style="margin: 0 auto;">
            <p
              style="
              text-align: center;
              color: #fff;
              font-size: 42px;
              font-weight: bold;
              font-family: sans-serif;
              margin: 0;
            "
            >
              Wilkommen!
            </p>
            <br />
            <p
              style="
              text-align: center;
              color: #fff;
              font-size: 28px;
              font-weight: bold;
              font-family: sans-serif;
              margin: 0;
            "
            >
              You are now a new member of the ${communityName} sharing
              community!
            </p>
          </div>
        </div>

        <div style="width: calc(100% - 60px); background: #fff; padding: 30px;">
          <p
            style="
            text-align: center;
            color: #3f3d56;
            font-size: 28px;
            font-weight: bold;
            font-family: sans-serif;
            margin-bottom: 20px;
          "
          >
            You are a hero already!
          </p>
          <p
            style="
            text-align: center;
            color: #ff9635;
            font-size: 28px;
            font-weight: bold;
            font-family: sans-serif;
            margin-bottom: 20px;
          "
          >
            How to use the platform?
          </p>
          <p
            style="
            text-align: center;
            color: #3f3d56;
            font-size: 18px;
            font-weight: normal;
            font-family: sans-serif;
            margin-bottom: 20px;
          "
          >
            Whenever you need something that you don’t own yet. Simply request
            it from your neighbours and borrow it for the time needed!
          </p>
          <p
            style="
            text-align: center;
            color: #3f3d56;
            font-size: 28px;
            font-weight: normal;
            font-family: sans-serif;
            margin-bottom: 20px;
          "
          >
            Start by making your items available to the community!
          </p>
          <p
            style="
            text-align: center;
            color: #ff9635;
            font-size: 28px;
            font-weight: bold;
            font-family: sans-serif;
            margin-bottom: 20px;
          "
          >
            Why should I share at all?
          </p>
          <p
            style="
            text-align: center;
            color: #3f3d56;
            font-size: 18px;
            font-weight: normal;
            font-family: sans-serif;
            margin-bottom: 20px;
          "
          >
            Did you know that 80% of our owned items is only used once per
            month. Living in clutter of items we do not use can be stressful.
            Instead of owning everything, why not own the essentials and borrow
            the rest. The goal of this platform is to make all the available
            items visible to your members so they can be requested at any time!
          </p>
          <p
            style="
            text-align: center;
            color: #ff9635;
            font-size: 28px;
            font-weight: bold;
            font-family: sans-serif;
            margin-bottom: 20px;
          "
          >
            Examples of other communities:
            <span style="color: #3f3d56;"
              >books, drill set, ladder, special kitchen tools...</span
            >!
          </p>
          <a
            href="${confirmationUrl}"
            style="
            display: block;
            width: 35%;
            margin: auto;
            border-radius: 12px;
            background: #ff9635;
            border-style: none;
            cursor: pointer;
            padding: 2px 10px;
            text-decoration: none;
          "
          >
            <p
              style="
              text-align: center;
              color: #fff;
              font-size: 16px;
              font-weight: bold;
              font-family: sans-serif;
              cursor: pointer;
            "
            >
              Share now!
            </p>
          </a>
          <p
            style="
            text-align: center;
            color: #3f3d56;
            font-size: 9px;
            font-weight: bold;
            font-family: sans-serif;
            margin-top: 20px;
          "
          >
            This is a closed community. Only members of your community can see
            and borrow your items.
          </p>
        </div>
        <div
          style="
          display: flex;
          justify-content: space-between;
          width: 100%;
          height: 100px;
          background: #3f3d56;
        "
        >
          <div
            style="
            width: calc(33% - 10px);
            height: calc(100% - 4px);
            padding-top: 4px;
            padding-left: 10px;
          "
          >
            <p
              style="color: #ff9635; font-size: 11px; font-family: sans-serif;"
            >
              Do you need help?
              <br />
              Do you have feedback?
            </p>
            <p style="color: #fff; font-size: 11px; font-family: sans-serif;">
              Contact us any time via:
              <br />
              sharinghood@gmail.com
            </p>
          </div>
          <div
            style="width: calc(33% - 10px); height: 100%; background: #3f3d56;"
          >
            <p
              style="
              line-height: 100px;
              text-align: center;
              color: #fff;
              font-size: 12px;
              font-family: sans-serif;
              margin: 0;
            "
            >
              www.sharinghood.de
            </p>
          </div>
          <div
            style="
            position: relative;
            padding-right: 10px;
            width: calc(33% - 10px);
            height: 100%;
            line-height: 100px;
            text-align: center;
            background: #3f3d56;
          "
          >
            <img
              alt="logo"
              src="https://i.imgur.com/aNL9One.png"
              style="width: 80px; height: 60px; float: right; margin-top: 20px;"
            />
          </div>
        </div>
      </body>
    </html>
  `;

  // Get status & return status
  const info = await sendMail(to, subject, text, html);

  return info;
}
