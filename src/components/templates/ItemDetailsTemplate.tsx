import type { FetchNextPageOptions, InfiniteQueryObserverResult } from "@tanstack/react-query";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import type { FC, PropsWithChildren } from "react";

import { useCommunityMember } from "../../hooks/useCommunityMember";
import { useSession } from "../../hooks/useSession";
import { appConfig } from "../../lib/client/appConfig";
import type { TGetThreadsResponse } from "../../pages/api/threads";

interface IThread {
  thread: Pick<TGetThreadsResponse["threads"][number], "content" | "created_at" | "creator_id">;
}

const Thread: FC<IThread> = ({ thread: { creator_id, content, created_at } }) => {
  const { getMember } = useCommunityMember();
  const creator = getMember(creator_id);

  return (
    <>
      <div className="h-[1px] bg-neutral-200" />
      <div className="my-2 flex">
        <div className="mr-2 aspect-square h-12 w-12 shrink-0 overflow-hidden rounded-full">
          {creator ? (
            <Image
              alt="A picture of an item"
              height={500}
              src={creator.image_url ?? appConfig.imagePlaceholderPath.profile}
              width={500}
            />
          ) : null}
        </div>
        <div className="w-full">
          <div className="flex w-full flex-1 flex-row items-center justify-between">
            <p className="font-medium">{getMember(creator_id)?.name}</p>
            <p className="text-sm">{format(new Date(created_at), "dd.MM.yy HH:MM")}</p>
          </div>
          <p className="text-sm">{content}</p>
        </div>
      </div>
    </>
  );
};

interface IItemDetailsTemplate {
  title: string;
  description: string;
  imageUrl: string;
  creatorId: string;
  threads?: TGetThreadsResponse["threads"];
  hasMoreThreads: boolean | undefined;
  loadMoreThreads: (options?: FetchNextPageOptions) => Promise<InfiniteQueryObserverResult<TGetThreadsResponse>>;
}

export const ItemDetailsTemplate: FC<PropsWithChildren<IItemDetailsTemplate>> = ({
  title,
  description,
  imageUrl,
  creatorId,
  threads,
  hasMoreThreads,
  loadMoreThreads,
  children,
}) => {
  const { getMember } = useCommunityMember();
  const { user } = useSession();
  const creator = getMember(creatorId);

  const isUserCreator = user?.id === creatorId;

  return (
    <>
      <div className="my-7 flex">
        <div className="w-100 h-64 overflow-hidden">
          <Image alt="A picture of an item" height={500} src={imageUrl} width={500} />
        </div>
        <div className="flex flex-1 flex-col pl-4">
          <p className="mb-2 text-xl font-medium">{title}</p>
          <p className="mb-1 text-sm">{description}</p>
          <div className="flex h-44">
            <div>{children}</div>
            <div className="flex flex-1 items-end justify-end">
              <div className="flex items-center">
                <div>
                  <p className="text-sm">by</p>
                  {isUserCreator ? (
                    <p className="font-medium">You</p>
                  ) : (
                    <Link href={`/members/${creator?.id}`}>
                      <p className="font-medium hover:underline">{creator?.name}</p>
                    </Link>
                  )}
                  <p className="text-sm">Member since: 30.03.20</p>
                </div>
                <div className="w-26 ml-4 aspect-square overflow-hidden rounded-full">
                  <Image
                    alt="A picture of an item"
                    height={500}
                    src={creator?.image_url ?? appConfig.imagePlaceholderPath.profile}
                    width={500}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {hasMoreThreads ? (
        <button onClick={async () => loadMoreThreads()} type="button">
          Load older threads
        </button>
      ) : null}
      {threads?.map(({ id, ...thread }) => (
        <Thread key={id} thread={thread} />
      ))}
    </>
  );
};
