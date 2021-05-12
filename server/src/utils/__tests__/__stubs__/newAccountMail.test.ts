import nodemailer from "nodemailer";
// @ts-ignore
import { stubTransport } from "nodemailer-stub";
import generateFooter from "../../sendMail/generateFooter";
import newAccountMail from "../../sendMail/newAccountMail";

jest.mock("../../sendMail/generateFooter");
const mockedGenerateFooter = generateFooter as jest.Mock<any>;

describe("Test newAccountMail function", () => {
  it("Should send new community mail", async () => {
    const transport = nodemailer.createTransport(stubTransport);
    jest
      .spyOn(nodemailer, "createTransport")
      .mockImplementation(() => transport);

    const accountMailArgs = {
      confirmationUrl: "https://sharinghood.co/share",
      communityName: "Mock community 01",
      recipientId: "stub01Id",
      to: "stub01@email.com",
      subject: "Stub 01 subject",
    };

    mockedGenerateFooter.mockImplementation(() => {});

    const mail = await newAccountMail({
      confirmationUrl: accountMailArgs.confirmationUrl,
      communityName: accountMailArgs.communityName,
      recipientId: accountMailArgs.recipientId,
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
