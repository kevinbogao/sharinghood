const { verify } = require('jsonwebtoken');

function tokenPayload(token) {
  try {
    return token ? verify(token, process.env.JWT_SECRET) : null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

module.exports = tokenPayload;
