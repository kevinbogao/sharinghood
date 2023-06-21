import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { object } from "zod";

import { Button } from "../../components/Button";
import { ImageInput, ImageInputTypeEnum } from "../../components/ImageInput";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Switch } from "../../components/Switch";
import { useCreatePostMutation } from "../../hooks/api/PostHooks";
import { useRequestQuery } from "../../hooks/api/RequestHooks";
import { useCommunityMember } from "../../hooks/useCommunityMember";
import { useForm } from "../../hooks/useForm";
import { useRouterQuery } from "../../hooks/useRouterQuery";
import { ToastTypeEnum } from "../../lib/client/enums";
import { useCommunityIdStore, useToastStore } from "../../lib/client/Store";
import { ITEM_CONDITION } from "../../lib/db/enums";
import { cuidSchema } from "../../lib/schema";
import { createPostBodySchema } from "../../lib/schema/posts";

const ShareItem: NextPage = () => {
  const [image, setImage] = useState<string | undefined>();
  const router = useRouter();
  const { query } = useRouterQuery(object({ request_id: cuidSchema.optional() }));
  const addToast = useToastStore((state) => state.addToast);
  const { communityId } = useCommunityIdStore((store) => ({ communityId: store.communityId }));
  const { register, handleSubmit, errors } = useForm(createPostBodySchema.omit({ community_id: true }));
  const { getMember } = useCommunityMember();

  const { data } = useRequestQuery(query?.request_id as string, {
    enabled: Boolean(query?.request_id),
  });

  const { mutate, isLoading } = useCreatePostMutation({
    onSuccess: ({ post }) => {
      addToast({ type: ToastTypeEnum.SUCCESS, message: `Successfully shared ${post.title}` });
      void router.push("/items");
    },
  });

  const member = query?.request_id && data?.request.community_id ? getMember(data.request.creator_id) : undefined;

  return (
    <>
      <Switch />
      <div className="flex flex-1">
        <form
          className="m-auto w-64"
          onSubmit={handleSubmit((form) =>
            mutate({
              ...form,
              image: image as string,
              community_id: communityId as string,
              ...(query?.request_id && { request_id: query.request_id }),
            })
          )}
        >
          {member?.name ? (
            <p className="mb-6 text-sm">{member.name} will be notified when you post this item for their request</p>
          ) : null}
          <ImageInput
            image={image}
            setImage={setImage}
            type={ImageInputTypeEnum.ITEM}
            {...register("image")}
            errText={errors.image}
          />
          <Input className="mb-2" errText={errors.title} placeholder="Title" {...register("title")} />
          <Input errText={errors.description} placeholder="Description" {...register("description")} />
          <p className="mb-1 text-sm">Condition:</p>
          <Select values={ITEM_CONDITION} {...register("condition")} />
          <div className="mb-3 mt-2 flex flex-1 justify-between align-middle">
            <p className="text-sm">This is a giveaway</p>
            <input
              className="rounded border border-neutral-300 bg-red-500 accent-black"
              type="checkbox"
              {...register("is_giveaway")}
            />
          </div>
          <Button isLoading={isLoading} type="submit">
            Create
          </Button>
        </form>
      </div>
    </>
  );
};

export default ShareItem;
