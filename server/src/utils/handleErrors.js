const { UserInputError } = require("apollo-server");

function capitalise(key) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function handleErrors(err) {
  if (err.name === "MongoError") {
    if (err.code === 11000) {
      Object.keys(err.keyValue).map((key) => {
        const capKey = capitalise(key);
        throw new UserInputError(`${key}: ${capKey} exists already`);
      });
    }
  }
}

module.exports = handleErrors;
