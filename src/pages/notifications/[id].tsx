import type { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

import { Button } from "../../components/Button";
import { NotificationsTemplate } from "../../components/templates/NotificationsTemplate";
import { useCreateMessageMutation } from "../../hooks/api/MessageHooks";
import { useNotification } from "../../hooks/api/useNotification";
import { useCommunityMember } from "../../hooks/useCommunityMember";
import { useForm } from "../../hooks/useForm";
import { useRouterQuery } from "../../hooks/useRouterQuery";
import { useSession } from "../../hooks/useSession";
import { TokenTypeEnum } from "../../lib/auth/enums";
import { appConfig } from "../../lib/client/appConfig";
import { queryClient } from "../../lib/client/queryClient";
import { QueryKeys } from "../../lib/client/QueryKeys";
import { baseQuerySchema } from "../../lib/schema";
import { createMessageBodySchema } from "../../lib/schema/messages";
import { SocketEventTypeEnum } from "../../services/listener/utils/enums";
import type { IClientToServerEvents, IServerToClientEvents } from "../../services/listener/utils/types";
import type { TGetMessagesResponse } from "../api/messages/[notification_id]";

interface IServerSideProps {
  token: string | undefined;
}

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps<IServerSideProps> = async ({ req }) => {
  const token = req.cookies[TokenTypeEnum.ACCESS_TOKEN];
  return { props: { token } };
};

export const NotificationDetails: NextPage<IServerSideProps> = ({ token }) => {
  const { user } = useSession();
  const { query } = useRouterQuery(baseQuerySchema);
  const { getMember } = useCommunityMember();
  const { register, handleSubmit, reset } = useForm(createMessageBodySchema.pick({ content: true }));

  const { data } = useNotification();
  const { mutate } = useCreateMessageMutation({
    onSettled: () => reset(),
  });

  const userId =
    data.notification?.creator_id === user?.id ? data.notification?.recipient_id : data.notification?.creator_id;
  const creator = getMember(userId as string);

  useEffect(() => {
    if (!query?.id) {
      return;
    }

    // Connect to socket server
    const socket: Socket<IServerToClientEvents, IClientToServerEvents> = io(appConfig.socketUrl, {
      auth: { token },
      ...appConfig.socket,
    });

    // Join channel
    socket.emit(SocketEventTypeEnum.JOIN_CHANNEL, query.id);

    // Listren to new message
    socket.on(SocketEventTypeEnum.NOTIFICATION_MESSAGE, (payload) => {
      if (payload.message.creator_id !== user?.id) {
        const queryKeys = QueryKeys.Messages.messages(payload.message.notification_id);

        queryClient.setQueryData<TGetMessagesResponse>(queryKeys, (prev) => ({
          messages: [...(prev?.messages ?? []), payload.message],
        }));
      }
    });

    // client-side
    socket.on("connect_error", (err) => {
      // eslint-disable-next-line no-console
      console.error(err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [query?.id, token, user?.id]);

  return (
    <NotificationsTemplate>
      <div className="bg-stone-100 px-4 py-2">
        {creator ? (
          <div className="flex items-center justify-center">
            <Image
              alt="A profile picture"
              className="h-10 w-10 overflow-hidden rounded-full object-cover"
              height={200}
              src={creator.image_url ?? appConfig.imagePlaceholderPath.profile}
              width={200}
            />
            <p className="ml-4 font-medium">{creator.name}</p>
          </div>
        ) : null}
      </div>
      <div className="flex-1 overflow-y-scroll px-4">
        {data.messages?.map(({ id, content, creator_id }) =>
          user?.id === creator_id ? (
            <div className="flex justify-end" key={id}>
              <p className="max-w-58 my-1 rounded-xl bg-stone-100 px-3 py-1.5 text-sm">{content}</p>
            </div>
          ) : (
            <div className="flex" key={id}>
              <p className="max-w-58 my-1 rounded-xl bg-black px-3 py-1.5 text-sm text-white">{content}</p>
            </div>
          )
        )}
      </div>
      <form
        className="flex items-center justify-center"
        onSubmit={handleSubmit(({ content }) => mutate({ content, notification_id: query?.id as string }))}
      >
        <input
          className="ml-4 flex h-10 w-full flex-1 rounded border border-neutral-300 px-3 py-2 text-sm font-light placeholder:italic placeholder:text-neutral-300 focus:border-black focus:outline-none"
          {...register("content")}
        />
        <div className="ml-4 w-24">
          <Button type="submit">Send</Button>
        </div>
      </form>
    </NotificationsTemplate>
  );
};

export default NotificationDetails;
