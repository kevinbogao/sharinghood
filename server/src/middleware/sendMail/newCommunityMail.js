const sendMail = require('./index');

async function newCommunityMail(communityUrl, to, subject, text = '') {
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
              Put one in the hallway, or print several and hand them out to the
              mailboxes.
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
              If you believe that neighbours keep considering your invitation
              spam, why not leave your personal email / number and offer your
              help!
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
              <span style="color: #ff9635;">1. </span><strong>Copy</strong> your
              link down below.
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
              ${communityUrl}
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
              <span style="color: #ff9635;">2. </span><strong>Paste</strong> it
              in a QR Code generator. (You can find several)
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
              <span style="color: #ff9635;">4. </span><strong>Add</strong> Add
              it on your PDF.
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

module.exports = newCommunityMail;
