import gcm, { IResponseBody } from "node-gcm";
import { getConnection, In } from "typeorm";
import { User, Token } from "../api/entities";

async function removeInvalidTokens(invalidTokens: string[]): Promise<void> {
  const connection = getConnection();
  const tokenRepository = connection.getRepository(Token);

  const tokens = await tokenRepository.find({
    where: { firebase: In(invalidTokens) },
  });
  await tokenRepository.remove(tokens);
}

export default function pushNotification(
  data: Record<string, string>,
  body: string,
  receivers: User[]
): void {
  const sender = new gcm.Sender(process.env.FCM_API_KEY!);

  const message = new gcm.Message({
    data,
    notification: {
      title: "Sharinghood",
      body,
      icon: "https://res.cloudinary.com/dyr3b99uj/image/upload/v1595095559/qgrumirwk412dq4t0hql.png",
    },
  });

  const registrationTokens = receivers
    .map((receiver) => receiver.tokens.map((token) => token.firebase))
    .flat(1);

  sender.send(
    message,
    { registrationTokens },
    (err: any, res: IResponseBody) => {
      if (err) console.log(err);
      else {
        const invalidTokens = res.results?.reduce(
          (arr: string[], res, idx) =>
            res.error ? arr.concat(registrationTokens[idx]) : arr,
          []
        );

        if (invalidTokens) removeInvalidTokens(invalidTokens);
      }
    }
  );
}
