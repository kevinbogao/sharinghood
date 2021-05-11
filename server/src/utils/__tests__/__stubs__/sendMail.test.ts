import nodemailer from "nodemailer";
// @ts-ignore
import { stubTransport } from "nodemailer-stub";
import sendMail from "../../sendMail/index";

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
            <p>Stub HTML content</p>
          </div>
        </body>
      </html>
    `,
    };

    // SendMail with mailArgs
    const mail = await sendMail({
      to: mailArgs.to,
      subject: mailArgs.subject,
      text: mailArgs.text,
      html: mailArgs.html,
    });

    expect(mail).toMatchObject({
      from: "sharinghood@gmail.com",
      subject: mailArgs.subject,
      to: expect.arrayContaining([mailArgs.to]),
    });
  });
});
