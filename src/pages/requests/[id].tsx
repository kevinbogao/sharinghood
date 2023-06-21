import { TimeFrameEnum } from "@prisma/client";
import { format } from "date-fns";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";

import { Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
import { Input } from "../../components/Input";
import { ItemDetailsTemplate } from "../../components/templates/ItemDetailsTemplate";
import { useRequestQuery } from "../../hooks/api/RequestHooks";
import { useCreateThreadMutation, useThreadsQuery } from "../../hooks/api/ThreadsHooks";
import { useCommunityMember } from "../../hooks/useCommunityMember";
import { useForm } from "../../hooks/useForm";
import { useRouterQuery } from "../../hooks/useRouterQuery";
import { useSession } from "../../hooks/useSession";
import { apiRequestSSR } from "../../lib/client/apiRequest";
import { useCommunityIdStore } from "../../lib/client/Store";
import { baseQuerySchema } from "../../lib/schema";
import { createThreadBodySchema } from "../../lib/schema/threads";
import type { TGetRequestResponse } from "../api/requests/[id]";
import type { TGetThreadsResponse } from "../api/threads";

interface IRequestDetails {
  request: TGetRequestResponse;
  threads: TGetThreadsResponse | null;
}

export const getServerSideProps: GetServerSideProps<IRequestDetails> = async ({ params, req }) => {
  const communityId = req.cookies.community_id;

  const [request, threads] = await Promise.all([
    apiRequestSSR<TGetRequestResponse>(req, `/requests/${params?.id}`),
    apiRequestSSR<TGetThreadsResponse>(req, `/threads?request_id=${params?.id}&community_id=${communityId}`),
  ]);

  if (!request) {
    return { notFound: true };
  }

  return { props: { request, threads } };
};

const RequestDetails: NextPage<IRequestDetails> = ({ request, threads }) => {
  const router = useRouter();
  const { user } = useSession();
  const { communityId } = useCommunityIdStore((store) => ({ communityId: store.communityId }));
  const { register, handleSubmit, reset } = useForm(createThreadBodySchema.pick({ content: true }));
  const { query } = useRouterQuery(baseQuerySchema);

  const { data: requestData } = useRequestQuery(query?.id as string, {
    enabled: Boolean(query?.id),
    initialData: request,
  });
  const {
    data: threadsData,
    hasNextPage,
    fetchNextPage,
  } = useThreadsQuery(
    { communityId: communityId as string, requestId: query?.id },
    {
      enabled: Boolean(query?.id) && Boolean(communityId),
      ...(threads && {
        initialData: {
          pageParams: [undefined],
          pages: [threads],
        },
      }),
    }
  );
  const { mutate } = useCreateThreadMutation({ onSettled: () => reset() });

  const isUserCreator = user?.id === requestData?.request.creator_id;

  const { getMember } = useCommunityMember();
  const creator = getMember(requestData?.request.creator_id as string);

  const getDateNeedTime = (
    timeFrame: TimeFrameEnum,
    dateNeed: Date | null,
    dateReturn: Date | null
  ): string | undefined => {
    if (timeFrame === TimeFrameEnum.SPECIFIC && dateNeed) {
      if (dateReturn) {
        return `${format(new Date(dateNeed), "dd.MM.yy")} - ${format(new Date(dateReturn), "dd.MM.yy")}`;
      }

      return format(new Date(dateNeed), "dd.MM.yy");
    }
  };

  const threadsArr = threadsData?.pages
    .reduce<Array<TGetThreadsResponse["threads"][number]>>((acc, page) => acc.concat(page.threads), [])
    .reverse();

  return (
    <div className="mx-auto w-[1080px]">
      {requestData?.request ? (
        <ItemDetailsTemplate
          creatorId={requestData.request.creator_id}
          description={requestData.request.description}
          hasMoreThreads={hasNextPage}
          imageUrl={requestData.request.image_url}
          loadMoreThreads={fetchNextPage}
          threads={threadsArr}
          title={requestData.request.title}
        >
          <div className="my-2 flex items-center">
            <Icon className="mr-2 h-4" type="clock" />
            <p>
              {getDateNeedTime(
                requestData.request.time_frame,
                requestData.request.date_need,
                requestData.request.date_return
              )}
            </p>
          </div>
          {isUserCreator ? (
            <Button type="button">Delete</Button>
          ) : (
            <Button
              onClick={async () =>
                router.push({ pathname: "/items/share", query: { request_id: requestData.request.id } })
              }
              type="button"
            >
              Help {creator?.name}
            </Button>
          )}
        </ItemDetailsTemplate>
      ) : null}
      <form
        onSubmit={handleSubmit((form) => {
          if (query?.id) {
            mutate({ ...form, community_id: communityId as string, request_id: query.id });
          }
        })}
      >
        <div className="flex justify-start align-top">
          <div className="mt-2 w-full">
            <Input placeholder="Comment something..." type="text" {...register("content")} />
          </div>
          <div className="ml-4 w-24">
            <Button type="submit">Send</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RequestDetails;
