import nodemailer from "nodemailer";
// @ts-ignore
import { stubTransport } from "nodemailer-stub";
import generateFooter from "../../sendMail/generateFooter";
import newCommunityMail from "../../sendMail/newCommunityMail";

jest.mock("../../sendMail/generateFooter");
const mockedGenerateFooter = generateFooter as jest.Mock<any>;

describe("Test newCommunityMail function", () => {
  it("Should send new community mail", async () => {
    const transport = nodemailer.createTransport(stubTransport);
    jest
      .spyOn(nodemailer, "createTransport")
      .mockImplementation(() => transport);

    const communityMailArgs = {
      communityUrl: "https://sharinghood.co/community/mockCommunity01",
      recipientId: "stub01Id",
      to: "stub01@email.com",
      subject: "Stub 01 subject",
    };

    mockedGenerateFooter.mockImplementation(() => {});

    const mail = await newCommunityMail({
      communityUrl: communityMailArgs.communityUrl,
      recipientId: communityMailArgs.recipientId,
      to: communityMailArgs.to,
      subject: communityMailArgs.subject,
    });

    expect(mail).toMatchObject({
      from: "sharinghood@gmail.com",
      subject: communityMailArgs.subject,
      to: expect.arrayContaining([communityMailArgs.to]),
    });
  });
});
