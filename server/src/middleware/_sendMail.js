const nodemailer = require('nodemailer');

// 0: commnity
// 1: account
// 2: post
// 3: booking

function generateHtml(type, user, item, communityName, url) {
  switch (type) {
    case 0:
      return html`
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
                  Congrats, you have successfully created your Sharinghood
                  Community!
                </p>
              </div>
            </div>

            <p
              style="
              text-align: center;
              color: #3f3d56;
              font-size: 24px;
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
              font-size: 24px;
              font-weight: bold;
              font-family: sans-serif;
              margin-bottom: 20px;
            "
            >
              Here are some tips on how to invite your neighbours!
            </p>
            <div style="display: flex; width: 100%; background: #fff;">
              <div
                style="
                width: calc(50% - 100px);
                background: #fff;
                padding: 50px;
                padding-top: 0;
              "
              >
                <p
                  style="
                  text-align: left;
                  color: #ff9635;
                  font-size: 20px;
                  font-weight: bold;
                  font-family: sans-serif;
                  margin-bottom: 20px;
                "
                >
                  <span style="color: #3f3d56;">TIP 1: </span>Print out your
                  invitation PDF!
                </p>
                <p
                  style="
                  text-align: left;
                  color: #3f3d56;
                  font-size: 18px;
                  font-weight: normal;
                  font-family: sans-serif;
                  margin-bottom: 20px;
                "
                >
                  Put one in the hallway, or print several and hand them out to
                  the mailboxes.
                </p>
                <p
                  style="
                  text-align: left;
                  color: #3f3d56;
                  font-size: 20px;
                  font-weight: bold;
                  font-family: sans-serif;
                  margin-bottom: 20px;
                "
                >
                  Don’t have a printer? Why not become
                  <span style="color: #ff9635;">creative</span>?
                </p>
                <p
                  style="
                  text-align: left;
                  color: #ff9635;
                  font-size: 20px;
                  font-weight: bold;
                  font-family: sans-serif;
                  margin-bottom: 20px;
                "
                >
                  <span style="color: #3f3d56;">TIP 3: </span>Leave a personal
                  contact information.
                </p>
                <p
                  style="
                  text-align: left;
                  color: #3f3d56;
                  font-size: 18px;
                  font-weight: normal;
                  font-family: sans-serif;
                  margin-bottom: 20px;
                "
                >
                  If you believe that neighbours keep considering your
                  invitation spam, why not leave your personal email / number
                  and offer your help!
                </p>
              </div>
              <div
                style="
                width: calc(50% - 100px);
                background: #fff;
                padding: 50px;
                padding-top: 0;
              "
              >
                <p
                  style="
                  text-align: left;
                  color: #ff9635;
                  font-size: 20px;
                  font-weight: bold;
                  font-family: sans-serif;
                  margin-bottom: 20px;
                "
                >
                  <span style="color: #3f3d56;">TIP 2: </span>Create your own QR
                  Code with your link
                </p>
                <p
                  style="
                  text-align: left;
                  color: #3f3d56;
                  font-size: 18px;
                  font-weight: normal;
                  font-family: sans-serif;
                  margin-bottom: 10px;
                "
                >
                  <span style="color: #ff9635;">1. </span
                  ><strong>Copy</strong> your link down below.
                </p>
                <p
                  style="
                  text-align: center;
                  color: #3f3d56;
                  font-size: 14px;
                  font-weight: bold;
                  font-family: sans-serif;
                  margin-bottom: 10px;
                "
                >
                  ${url}
                </p>
                <p
                  style="
                  text-align: left;
                  color: #3f3d56;
                  font-size: 18px;
                  font-weight: normal;
                  font-family: sans-serif;
                  margin-bottom: 10px;
                "
                >
                  <span style="color: #ff9635;">2. </span
                  ><strong>Paste</strong> it in a QR Code generator. (You can
                  find several)
                </p>
                <p
                  style="
                  text-align: left;
                  color: #3f3d56;
                  font-size: 18px;
                  font-weight: normal;
                  font-family: sans-serif;
                  margin-bottom: 10px;
                "
                >
                  <span style="color: #ff9635;">3. </span
                  ><strong>Screenshot</strong> it or download if free.
                </p>
                <p
                  style="
                  text-align: left;
                  color: #3f3d56;
                  font-size: 18px;
                  font-weight: normal;
                  font-family: sans-serif;
                  margin-bottom: 10px;
                "
                >
                  <span style="color: #ff9635;">4. </span
                  ><strong>Add</strong> Add it on your PDF.
                </p>

                <p
                  style="
                  text-align: left;
                  color: #ff9635;
                  font-size: 18px;
                  font-weight: bold;
                  font-family: sans-serif;
                  margin-bottom: 20px;
                "
                >
                  Make sure to include the link / or the code to your community!
                </p>

                <p
                  style="
                  text-align: left;
                  color: #3f3d56;
                  font-size: 18px;
                  font-weight: bold;
                  font-family: sans-serif;
                  margin-bottom: 20px;
                "
                >
                  Didn’t save it? You can find your link in your community!
                </p>

                <p
                  style="
                  text-align: left;
                  color: #3f3d56;
                  font-size: 24px;
                  font-weight: bold;
                  font-family: sans-serif;
                  margin-bottom: 20px;
                "
                >
                  Have fun, the
                  <span style="color: #ff9635;">Sharinghood Team</span>
                </p>
              </div>
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
                <p
                  style="color: #fff; font-size: 11px; font-family: sans-serif;"
                >
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
    case 1:
      return html`
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

            <div
              style="width: calc(100% - 60px); background: #fff; padding: 30px;"
            >
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
                Whenever you need something that you don’t own yet. Simply
                request it from your neighbours and borrow it for the time
                needed!
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
                month. Living in clutter of items we do not use can be
                stressful. Instead of owning everything, why not own the
                essentials and borrow the rest. The goal of this platform is to
                make all the available items visible to your members so they can
                be requested at any time!
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
                Examples of other comunities:
                <span style="color: #3f3d56;"
                  >books, drill set, ladder, special kitchen tools...</span
                >!
              </p>
              <a
                href=${confirmationsUrl}
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
                This is a closed community. Only members of your commnity can
                see and borrow your items.
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
                <p
                  style="color: #fff; font-size: 11px; font-family: sans-serif;"
                >
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

    case 2:
      return html`
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
            <div
              style="width: calc(100% - 40px); background: #fff; padding: 20px;"
            >
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
                ${user.name} from your community is looking for
                <span style="color: #3f3d56;">${item.name}</span>!
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
                src="{{ item_image }}"
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
                By: <span style="color: #3f3d56;">{{ date }}</span>
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
                href="{{ item_url }}"
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
                This is a closed community. Only members of your commnity can
                see and borrow your items.
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
                <p
                  style="color: #fff; font-size: 11px; font-family: sans-serif;"
                >
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
    case 3:
      return null;
    default:
      break;
  }

  const BOOKING_NOTIFICATION = `
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
            You have a new notification
          </p>
        </div>
        <div style="width: calc(100% - 40px); background: #fff; padding: 20px;">
          <img
            style="
            display: block;
            margin-left: auto;
            margin-right: auto;
            width: 200px;
            height: 200px;
            object-fit: contain;
          "
            src="https://i.imgur.com/Z2j7440.png"
          />
          <a
            href="{{ dashboard_url }}"
            style="
            display: block;
            width: 30%;
            margin: auto;
            margin-top: 20px;
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
              View my Bookings
            </p>
          </a>
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

  // Return `
  // `;
}

async function sendMail() {
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sharinghood@gmail.com',
      pass: '6minutes',
    },
  });

  const HTML_CONTENT = generateHtml('https://www.sharinghood.de/');

  const info = await transport.sendMail({
    from: '"Sharinghood" <sharinghood@gmail.com>',
    to: 'k_gao@aol.com',
    subject: 'Test',
    text: 'Hello world?',
    html: HTML_CONTENT,
  });

  return info;
}

module.exports = sendMail;
