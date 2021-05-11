import nodemailer from "nodemailer";
// @ts-ignore
import { stubTransport } from "nodemailer-stub";
import newCommunityMail from "../../sendMail/newCommunityMail";

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
