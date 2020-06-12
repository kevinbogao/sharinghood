const { sign, verify } = require('jsonwebtoken');

// function generateToken(user, isAccessToken) {
//   return sign(
//     {
//       userId: user._id,
//       ...(isAccessToken && {
//         userName: user.name,
//         email: user.email,
//         communityId: user.community,
//       }),
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: isAccessToken ? '1h' : '7d' }
//   );
// }

function generateTokens(user, res) {
  // Save refreshToken as cookie
  res.cookie(
    'refreshToken',
    sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
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

function varifyToken(token) {
  try {
    return token ? verify(token, process.env.JWT_SECRET) : null;
  } catch (err) {
    return null;
  }
}

module.exports = { generateTokens, varifyToken };
