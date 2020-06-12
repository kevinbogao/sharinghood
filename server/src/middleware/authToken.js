const { sign, verify } = require('jsonwebtoken');

function generateTokens(user, res) {
  // Save refreshToken as cookie
  res.cookie(
    'refreshToken',
    sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10s' }),
    { httpOnly: true }
  );

  // Return accessToken
  return sign(
    {
      userId: user._id,
      userName: user.name,
      email: user.email,
      communityId: user.community,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function verifyToken(token) {
  try {
    return token ? verify(token, process.env.JWT_SECRET) : null;
  } catch (err) {
    return null;
  }
}

module.exports = { generateTokens, verifyToken };
