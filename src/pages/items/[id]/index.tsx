import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { BookingModal } from "../../../components/modals/BookingModal";
import { ItemDetailsTemplate } from "../../../components/templates/ItemDetailsTemplate";
import { useSessionQuery } from "../../../hooks/api/AuthHooks";
import { usePostQuery } from "../../../hooks/api/PostHooks";
import { useCreateThreadMutation, useThreadsQuery } from "../../../hooks/api/ThreadsHooks";
import { useForm } from "../../../hooks/useForm";
import { useRouterQuery } from "../../../hooks/useRouterQuery";
import { apiRequestSSR } from "../../../lib/client/apiRequest";
import { useCommunityIdStore } from "../../../lib/client/Store";
import { ITEM_CONDITION } from "../../../lib/db/enums";
import { baseQuerySchema } from "../../../lib/schema";
import { createThreadBodySchema } from "../../../lib/schema/threads";
import type { TGetPostResponse } from "../../api/posts/[id]";
import type { TGetThreadsResponse } from "../../api/threads";

interface IItemDetails {
  post: TGetPostResponse;
  threads: TGetThreadsResponse | null;
}

export const getServerSideProps: GetServerSideProps<IItemDetails> = async ({ params, req }) => {
  const communityId = req.cookies.community_id;

  const [post, threads] = await Promise.all([
    apiRequestSSR<TGetPostResponse>(req, `/posts/${params?.id}`),
    apiRequestSSR<TGetThreadsResponse>(req, `/threads?post_id=${params?.id}&community_id=${communityId}`),
  ]);

  if (!post) {
    return { notFound: true };
  }

  return { props: { post, threads } };
};

const ItemDetails: NextPage<IItemDetails> = ({ post, threads }) => {
  const router = useRouter();
  const { query } = useRouterQuery(baseQuerySchema);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const communityId = useCommunityIdStore((store) => store.communityId);
  const { register, handleSubmit, reset } = useForm(createThreadBodySchema.pick({ content: true }));

  const { data: sessionData } = useSessionQuery();
  const { data: postData } = usePostQuery(query?.id as string, {
    enabled: Boolean(query?.id),
    initialData: post,
  });
  const {
    data: threadsData,
    hasNextPage,
    fetchNextPage,
  } = useThreadsQuery(
    { communityId: communityId as string, postId: query?.id },
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

  const threadsArr = threadsData?.pages
    .reduce<Array<TGetThreadsResponse["threads"][number]>>((acc, page) => acc.concat(page.threads), [])
    .reverse();

  return (
    <div className="mx-auto w-[1080px]">
      {postData?.post ? (
        <ItemDetailsTemplate
          creatorId={postData.post.creator_id}
          description={postData.post.description}
          hasMoreThreads={hasNextPage}
          imageUrl={postData.post.image_url}
          loadMoreThreads={fetchNextPage}
          threads={threadsArr}
          title={postData.post.title}
        >
          <p className="text-md">{ITEM_CONDITION[postData.post.condition]}</p>
          {postData.post.creator_id === sessionData?.user?.id ? (
            <Button className="w-24" onClick={async () => router.push(`/items/${query?.id}/edit`)} type="button">
              Edit
            </Button>
          ) : (
            <Button className="w-24" onClick={() => setIsModalOpen(true)} type="button">
              Borrow
            </Button>
          )}
          <BookingModal isModalOpen={isModalOpen} postId={query?.id ?? ""} setIsModalOpen={setIsModalOpen} />
        </ItemDetailsTemplate>
      ) : null}
      <form
        onSubmit={handleSubmit((form) => {
          if (query?.id) {
            mutate({ ...form, community_id: communityId as string, post_id: query.id });
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

export default ItemDetails;
