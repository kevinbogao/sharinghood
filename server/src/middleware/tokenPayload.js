const jwt = require('jsonwebtoken');

function tokenPayload(token) {
  try {
    return token ? jwt.verify(token, process.env.JWT_SECRET) : null;
  } catch (err) {
    return null;
  }
}

module.exports = tokenPayload;
