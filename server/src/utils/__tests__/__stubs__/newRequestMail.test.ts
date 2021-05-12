import nodemailer from "nodemailer";
import moment from "moment";
// @ts-ignore
import { stubTransport } from "nodemailer-stub";
import generateFooter from "../../sendMail/generateFooter";
import newRequestMail from "../../sendMail/newRequestMail";

jest.mock("../../sendMail/generateFooter");
const mockedGenerateFooter = generateFooter as jest.Mock<any>;

describe("Test newRequestMail function", () => {
  it("Should send new request mail", async () => {
    const transport = nodemailer.createTransport(stubTransport);
    jest
      .spyOn(nodemailer, "createTransport")
      .mockImplementation(() => transport);

    const recipients = [
      { _id: "mockUser01Id", email: "mock.user01@email.com" },
      { _id: "mockUser02Id", email: "mock.user02@email.com" },
    ];

    mockedGenerateFooter.mockImplementation(() => {});

    const requestMailArgs = {
      userName: "Mock user 01",
      itemName: "Mock item 01",
      itemImageUrl:
        "https://res.cloudinary.com/dyr3b99uj/image/upload/v1595095559/qgrumirwk412dq4t0hql.png",
      itemUrl: "https://sharinghood.co/shared/:_id",
      dateNeed: new Date(),
      to: "stub01@email.com",
      subject: "Mock user 01 requested Mock item 01 in your community.",
    };

    const mail = await newRequestMail({
      userName: requestMailArgs.userName,
      itemName: requestMailArgs.itemName,
      itemImageUrl: requestMailArgs.itemImageUrl,
      itemUrl: requestMailArgs.itemUrl,
      dateNeed: moment(+requestMailArgs.dateNeed).format("MMM DD"),
      recipients,
      subject: requestMailArgs.subject,
      text: "",
    });

    expect(mail).not.toBeDefined();
  });
});
