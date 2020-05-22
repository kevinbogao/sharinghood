const jwt = require('jsonwebtoken');

function tokenPayload(token) {
  try {
    if (token) {
      return jwt.verify(token, process.env.JWT_SECRET);
    }
    return null;
  } catch (err) {
    return null;
  }
}

module.exports = tokenPayload;
