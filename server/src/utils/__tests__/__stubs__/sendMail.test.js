const nodemailer = require("nodemailer");
const { stubTransport } = require("nodemailer-stub");
const sendMail = require("../../sendMail/index");

describe("Test sendMail function", () => {
  it("Should send mail", async () => {
    // Create stub transport
    const transport = nodemailer.createTransport(stubTransport);

    // Mock transport
    jest
      .spyOn(nodemailer, "createTransport")
      .mockImplementation(() => transport);

    const mailArgs = {
      to: "stub01@email.com",
      subject: "Stub 01 subject",
      text: "",
      html: `
      <!DOCTYPE html>
      <html>
        <body>
          <div>
            <p>Stub HMTL content</p>
          </div>
        </body>
      </html>
    `,
    };

    // SendMail with mailArgs
    const mail = await sendMail(
      mailArgs.to,
      mailArgs.subject,
      mailArgs.text,
      mailArgs.html
    );

    expect(mail).toMatchObject({
      from: "sharinghood@gmail.com",
      subject: mailArgs.subject,
      to: expect.arrayContaining([mailArgs.to]),
    });
  });
});
