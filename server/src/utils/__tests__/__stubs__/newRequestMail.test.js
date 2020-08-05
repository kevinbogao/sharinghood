const nodemailer = require('nodemailer');
const { stubTransport } = require('nodemailer-stub');
const newRequestMail = require('../../sendMail/newRequestMail');

describe('Test newRequestMail function', () => {
  it('Should send new community mail', async () => {
    const transport = nodemailer.createTransport(stubTransport);
    jest
      .spyOn(nodemailer, 'createTransport')
      .mockImplementation(() => transport);

    const requestMailArgs = {
      userName: 'Mock user 01',
      itemName: 'Mock item 01',
      itemImageUrl:
        'https://res.cloudinary.com/dyr3b99uj/image/upload/v1595095559/qgrumirwk412dq4t0hql.png',
      itemUrl: 'https://sharinghood.co/shared/:_id',
      dateNeed: new Date(),
      to: 'stub01@email.com',
      subject: 'Mock user 01 requested Mock item 01 in your community.',
    };

    const mail = await newRequestMail(
      requestMailArgs.userName,
      requestMailArgs.itemName,
      requestMailArgs.itemImageUrl,
      requestMailArgs.itemUrl,
      requestMailArgs.dateNeed,
      requestMailArgs.to,
      requestMailArgs.subject
    );

    expect(mail).toMatchObject({
      from: 'sharinghood@gmail.com',
      subject: requestMailArgs.subject,
      to: expect.arrayContaining([requestMailArgs.to]),
    });
  });
});
