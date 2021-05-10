import nodemailer from "nodemailer";
// @ts-ignore
import { stubTransport } from "nodemailer-stub";
import newAccountMail from "../../sendMail/newAccountMail";

describe("Test newAccountMail function", () => {
  it("Should send new community mail", async () => {
    const transport = nodemailer.createTransport(stubTransport);
    jest
      .spyOn(nodemailer, "createTransport")
      .mockImplementation(() => transport);

    const accountMailArgs = {
      confirmationUrl: "https://sharinghood.co/share",
      communityName: "Mock community 01",
      to: "stub01@email.com",
      subject: "Stub 01 subject",
    };

    const mail = await newAccountMail({
      confirmationUrl: accountMailArgs.confirmationUrl,
      communityName: accountMailArgs.communityName,
      to: accountMailArgs.to,
      subject: accountMailArgs.subject,
    });

    expect(mail).toMatchObject({
      from: "sharinghood@gmail.com",
      subject: accountMailArgs.subject,
      to: expect.arrayContaining([accountMailArgs.to]),
    });
  });
});
