const gcm = require('node-gcm');

function pushNotification(title, body, fcmTokens) {
  // Set up sender
  const sender = new gcm.Sender(process.env.FCM_API_KEY);

  // Prepare a message to be sent
  const message = new gcm.Message({
    data: {},
    notification: {
      title,
      body,
      icon:
        'https://res.cloudinary.com/dyr3b99uj/image/upload/v1595095559/qgrumirwk412dq4t0hql.png',
    },
  });

  sender.send(message, { registrationTokens: fcmTokens }, (err, res) => {
    if (err) console.log(err);

    const invalidTokens = fcmTokens.filter(
      (token, index) => res.results[index].error
    );
  });
}

module.exports = pushNotification;
