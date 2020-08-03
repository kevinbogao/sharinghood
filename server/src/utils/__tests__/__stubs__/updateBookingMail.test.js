const nodemailer = require('nodemailer');
const { stubTransport } = require('nodemailer-stub');
const updateBookingMail = require('../../sendMail/updateBookingMail');

describe('Test updateBookingMail function', () => {
  it('Should send new community mail', async () => {
    const transport = nodemailer.createTransport(stubTransport);
    jest
      .spyOn(nodemailer, 'createTransport')
      .mockImplementation(() => transport);

    const updateBookingMailArgs = {
      bookingsUrl: 'https://sharinghood.co/notifications',
      to: 'stub01@email.com',
      subject: 'Mock user 01 requested Mock item 01 in your community.',
    };

    const mail = await updateBookingMail(
      updateBookingMailArgs.bookingsUrl,
      updateBookingMailArgs.to,
      updateBookingMailArgs.subject
    );

    expect(mail).toMatchObject({
      from: 'sharinghood@gmail.com',
      subject: updateBookingMailArgs.subject,
      to: expect.arrayContaining([updateBookingMailArgs.to]),
    });
  });
});
