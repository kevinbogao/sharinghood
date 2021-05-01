import sendMail from "./index";

export default async function newRequestMail(
  userName: string,
  itemName: string,
  itemImageUrl: string,
  itemUrl: string,
  dateNeed: Date,
  to: string,
  subject: string,
  text: string = ""
) {
  const html = `
    <!DOCTYPE html>
    <html style="margin: 0; padding: 0;">
      <body style="margin-left: 15%; margin-right: 15%;">
        <div style="width: 100%; height: 60px; background: #3f3d56;">
          <p
            style="
            line-height: 60px;
            text-align: center;
            color: #fff;
            font-size: 20px;
            font-weight: bold;
            font-family: sans-serif;
            margin: 0;
          "
          >
            New request in your community!
          </p>
        </div>
        <div style="width: calc(100% - 40px); background: #fff; padding: 20px;">
          <p
            style="
            text-align: center;
            color: #ff9635;
            font-size: 26px;
            font-weight: bold;
            font-family: sans-serif;
            margin-bottom: 20px;
          "
          >
            ${userName} from your community is looking for
            <span style="color: #3f3d56;">${itemName}</span>!
          </p>
          <img
            style="
            display: block;
            margin-left: auto;
            margin-right: auto;
            width: 200px;
            height: 200px;
            object-fit: contain;
          "
            src=${itemImageUrl}
          />
          <p
            style="
            text-align: center;
            color: #ff9635;
            font-size: 26px;
            font-weight: bold;
            font-family: sans-serif;
          "
          >
            By: <span style="color: #3f3d56;">${dateNeed}</span>
          </p>
          <p
            style="
            text-align: center;
            color: #ff9635;
            font-size: 26px;
            font-weight: bold;
            font-family: sans-serif;
            margin-top: 40px;
          "
          >
            Can you help?
          </p>
          <a
            href=${itemUrl}
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
              font-size: 12px;
              font-weight: bold;
              font-family: sans-serif;
              cursor: pointer;
            "
            >
              Upload your item now!
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
