const { sign, verify } = require('jsonwebtoken');

function generateTokens(user) {
  // Save refreshToken as cookie
  // res.cookie(
  //   'refreshToken',
  //   sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  //   { httpOnly: true }
  // );

  const refreshToken = sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  const accessToken = sign(
    {
      userId: user._id,
      userName: user.name,
      email: user.email,
      communityId: user.community,
      ...(user.isAdmin && { isAdmin: true }),
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Return accessToken & refreshToken
  return { accessToken, refreshToken };
}

function verifyToken(token) {
  try {
    return token ? verify(token, process.env.JWT_SECRET) : null;
  } catch (err) {
    return null;
  }
}

module.exports = { generateTokens, verifyToken };
