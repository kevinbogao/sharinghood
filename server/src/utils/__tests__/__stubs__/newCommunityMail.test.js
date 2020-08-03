const nodemailer = require('nodemailer');
const { stubTransport } = require('nodemailer-stub');
const newCommunityMail = require('../../sendMail/newCommunityMail');

describe('Test newCommunityMail function', () => {
  it('Should send new community mail', async () => {
    const transport = nodemailer.createTransport(stubTransport);
    jest
      .spyOn(nodemailer, 'createTransport')
      .mockImplementation(() => transport);

    const communityMailArgs = {
      communityUrl: 'https://sharinghood.co/community/mockCommunity01',
      to: 'stub01@email.com',
      subject: 'Stub 01 subject',
    };

    const mail = await newCommunityMail(
      communityMailArgs.communityUrl,
      communityMailArgs.to,
      communityMailArgs.subject
    );

    expect(mail).toMatchObject({
      from: 'sharinghood@gmail.com',
      subject: communityMailArgs.subject,
      to: expect.arrayContaining([communityMailArgs.to]),
    });
  });
});
