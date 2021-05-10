import nodemailer from "nodemailer";
import moment from "moment";
// @ts-ignore
import { stubTransport } from "nodemailer-stub";
import newRequestMail from "../../sendMail/newRequestMail";

describe("Test newRequestMail function", () => {
  it("Should send new request mail", async () => {
    const transport = nodemailer.createTransport(stubTransport);
    jest
      .spyOn(nodemailer, "createTransport")
      .mockImplementation(() => transport);

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
      to: requestMailArgs.to,
      subject: requestMailArgs.subject,
      text: "",
    });

    expect(mail).toMatchObject({
      from: "sharinghood@gmail.com",
      subject: requestMailArgs.subject,
      to: expect.arrayContaining([requestMailArgs.to]),
    });
  });
});
