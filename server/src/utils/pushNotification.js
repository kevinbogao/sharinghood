const gcm = require('node-gcm');
const User = require('../models/user');

async function removeInvalidTokens(invalidTokens) {
  try {
    await Promise.all([
      Object.keys(invalidTokens).map((userId) =>
        Promise.resolve(
          User.updateOne(
            { _id: userId },
            { $pull: { fcmTokens: { $in: invalidTokens[userId] } } }
          )
        )
      ),
    ]);
  } catch (err) {
    console.log(err);
  }
}

function pushNotification(data, body, receivers) {
  // Set up sender
  const sender = new gcm.Sender(process.env.FCM_API_KEY);

  // Prepare a message to be sent
  const message = new gcm.Message({
    data,
    notification: {
      title: 'Sharinghood',
      body,
      icon:
        'https://res.cloudinary.com/dyr3b99uj/image/upload/v1595095559/qgrumirwk412dq4t0hql.png',
    },
  });

  try {
    // Get a list of FCM tokens from receivers
    const registrationTokens = receivers.map((user) => user.fcmTokens).flat(1);

    sender.send(message, { registrationTokens }, (err, res) => {
      // Log error on err
      if (err) console.log(err);

      // Create an object of invalid tokens lists with user id as key
      let index = 0;
      let invalidTokens = {};
      for (let i = 0; i < receivers.length; i++) {
        for (let j = 0; j < receivers[i].fcmTokens.length; j++) {
          if (res.results[index].error) {
            if (receivers[i]._id in invalidTokens) {
              invalidTokens[receivers[i]._id].push(receivers[i].fcmTokens[j]);
            } else {
              invalidTokens = {
                ...invalidTokens,
                [receivers[i]._id]: [receivers[i].fcmTokens[j]],
              };
            }
          }
          index++;
        }
      }

      // Remove invalid tokens from users
      removeInvalidTokens(invalidTokens);
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = pushNotification;
