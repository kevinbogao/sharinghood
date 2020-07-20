const gcm = require('node-gcm');

function pushNotification(data, body, fcmTokens) {
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

  sender.send(message, { registrationTokens: fcmTokens }, (err, res) => {
    // Log error on err
    if (err) console.log(err);

    // Get a list of invalid tokens
    // eslint-disable-next-line
    const invalidTokens = fcmTokens.filter(
      (token, index) => res.results[index].error
    );

    // console.log(invalidTokens);
  });
}

module.exports = pushNotification;
