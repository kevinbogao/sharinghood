import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

import { Button } from "../../../components/Button";
import { Checkbox } from "../../../components/Checkbox";
import { ImageInput, ImageInputTypeEnum } from "../../../components/ImageInput";
import { Input } from "../../../components/Input";
import { ItemCommunitiesModal } from "../../../components/modals/ItemCommunitiesModal";
import { Select } from "../../../components/Select";
import { usePostQuery, useUpdatePostMutation } from "../../../hooks/api/PostHooks";
import { useForm } from "../../../hooks/useForm";
import { useRouterQuery } from "../../../hooks/useRouterQuery";
import { ToastTypeEnum } from "../../../lib/client/enums";
import { useToastStore } from "../../../lib/client/Store";
import { ITEM_CONDITION } from "../../../lib/db/enums";
import { baseQuerySchema } from "../../../lib/schema";
import { updatePostBodySchema } from "../../../lib/schema/posts";

const EditItem: NextPage = () => {
  const [image, setImage] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);

  const { query } = useRouterQuery(baseQuerySchema);
  const { data } = usePostQuery(query?.id as string, { enabled: Boolean(query?.id) });
  const { register, handleSubmit, errors } = useForm(updatePostBodySchema);

  const { mutate, isLoading } = useUpdatePostMutation(query?.id as string, {
    onSuccess: ({ post: { id, title } }) => {
      addToast({ type: ToastTypeEnum.SUCCESS, message: `Successfully updated ${title}` });
      void router.push(`/items/${id}`);
    },
  });

  return (
    <div className="flex flex-1">
      <form className="m-auto w-64" onSubmit={handleSubmit((form) => mutate({ ...form, ...(image && { image }) }))}>
        <ImageInput image={image ?? data?.post.image_url} setImage={setImage} type={ImageInputTypeEnum.ITEM} />
        <Input
          className="mb-2"
          errText={errors.title}
          placeholder="title"
          {...register("title")}
          defaultValue={data?.post.title}
        />
        <Input
          errText={errors.description}
          placeholder="description"
          {...register("description")}
          defaultValue={data?.post.description}
        />
        <p className="mb-1 text-sm">Condition:</p>
        <Select values={ITEM_CONDITION} {...register("condition")} defaultValue={data?.post.condition} />
        <Checkbox
          label="This is a giveaway"
          {...register("is_giveaway")}
          defaultChecked={Boolean(data?.post.is_giveaway)}
        />
        <button className="mb-3 text-sm underline" onClick={() => setIsModalOpen(true)} type="button">
          Share this item in another community
        </button>
        <Button isLoading={isLoading} type="submit">
          Save
        </Button>
      </form>
      <ItemCommunitiesModal isModalOpen={isModalOpen} postId={data?.post.id} setIsModalOpen={setIsModalOpen} />
    </div>
  );
};

export default EditItem;
