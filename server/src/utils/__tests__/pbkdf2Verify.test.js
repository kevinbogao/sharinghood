const pbkdf2Verify = require('../pbkdf2Verify');

describe('[Utils.pbkdf2Verify]', () => {
  it('Should return true if password is valid', async () => {
    const password = '1234567';
    const hash =
      'pbkdf2_sha256$150000$snZYsk8O7sIu$cjmeydDZt1BGJK2T82tWWhK/cMHCxhex/yazi2TmNL8=';

    const res = await pbkdf2Verify(password, hash);

    expect(res).toBeTruthy();
  });

  it('Should throw error if hash is invalid', async () => {
    const password = '1234567';
    const hash = 'invalid_password_hash';
    expect.assertions(1);
    await expect(pbkdf2Verify(password, hash)).rejects.toThrow();
  });

  it('Should return false if password is invalid', async () => {
    const password = 'invalid_password';
    const hash =
      'pbkdf2_sha256$150000$snZYsk8O7sIu$cjmeydDZt1BGJK2T82tWWhK/cMHCxhex/yazi2TmNL8=';

    const res = await pbkdf2Verify(password, hash);

    expect(res).not.toBeTruthy();
  });
});
