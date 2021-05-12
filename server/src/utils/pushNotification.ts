import gcm, { IResponseBody } from "node-gcm";
import User from "../models/user";

type InvalidTokens = {
  [userId: string]: Array<string>;
};

export type Receiver = {
  _id: string;
  fcmTokens: Array<string>;
};

async function removeInvalidTokens(
  invalidTokens: InvalidTokens
): Promise<void> {
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

export default function pushNotification(
  data: any,
  body: string,
  receivers: Array<Receiver>
): void {
  // Set up sender
  const sender = new gcm.Sender(process.env.FCM_API_KEY as string);

  // Prepare a message to be sent
  const message = new gcm.Message({
    data,
    notification: {
      title: "Sharinghood",
      body,
      icon: "https://res.cloudinary.com/dyr3b99uj/image/upload/v1595095559/qgrumirwk412dq4t0hql.png",
    },
  });

  try {
    // Get a list of FCM tokens from receivers
    const registrationTokens: Array<string> = receivers
      .map((user) => user.fcmTokens)
      .flat(1);

    sender.send(
      message,
      { registrationTokens },
      (err: any, res: IResponseBody) => {
        // Log error on err
        if (err) console.log(err);

        // Create an object of invalid tokens lists with user id as key
        let index: number = 0;
        let invalidTokens: InvalidTokens = {};
        receivers.forEach((receiver) => {
          receiver.fcmTokens.forEach((fcmToken) => {
            if (res.results && res.results[index].error) {
              if (receiver._id in invalidTokens) {
                invalidTokens[receiver._id].push(fcmToken);
              } else {
                invalidTokens = {
                  ...invalidTokens,
                  [receiver._id]: [fcmToken],
                };
              }
            }
            index++;
          });
        });

        // Remove invalid tokens from users
        removeInvalidTokens(invalidTokens);
      }
    );
  } catch (err) {
    console.log(err);
  }
}
