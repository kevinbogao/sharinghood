import nodemailer from "nodemailer";
// @ts-ignore
import { stubTransport } from "nodemailer-stub";
import generateFooter from "../../sendMail/generateFooter";
import updateBookingMail from "../../sendMail/updateBookingMail";

jest.mock("../../sendMail/generateFooter");
const mockedGenerateFooter = generateFooter as jest.Mock<any>;

describe("Test updateBookingMail function", () => {
  it("Should send new community mail", async () => {
    const transport = nodemailer.createTransport(stubTransport);
    jest
      .spyOn(nodemailer, "createTransport")
      .mockImplementation(() => transport);

    const updateBookingMailArgs = {
      bookingsUrl: "https://sharinghood.co/notifications",
      recipientId: "stub01Id",
      to: "stub01@email.com",
      subject: "Mock user 01 requested Mock item 01 in your community.",
    };

    mockedGenerateFooter.mockImplementation(() => {});

    const mail = await updateBookingMail({
      bookingsUrl: updateBookingMailArgs.bookingsUrl,
      recipientId: updateBookingMailArgs.recipientId,
      to: updateBookingMailArgs.to,
      subject: updateBookingMailArgs.subject,
    });

    expect(mail).toMatchObject({
      from: "sharinghood@gmail.com",
      subject: updateBookingMailArgs.subject,
      to: expect.arrayContaining([updateBookingMailArgs.to]),
    });
  });
});
