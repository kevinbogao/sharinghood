import { TimeFrameEnum } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";

import { Button } from "../../components/Button";
import { ImageInput, ImageInputTypeEnum } from "../../components/ImageInput";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Switch } from "../../components/Switch";
import { useCreateRequestMutation } from "../../hooks/api/RequestHooks";
import { useForm } from "../../hooks/useForm";
import { useCommunityIdStore } from "../../lib/client/Store";
import { TIME_FRAME } from "../../lib/db/enums";
import { createRequestBodySchema } from "../../lib/schema/requests";

export const CreateRequest: NextPage = () => {
  const [image, setImage] = useState<string | undefined>();
  const [range, setRange] = useState<DateRange | undefined>();
  const router = useRouter();
  const { communityId } = useCommunityIdStore((store) => ({ communityId: store.communityId }));
  const { register, handleSubmit, watch, errors } = useForm(createRequestBodySchema.omit({ community_id: true }));

  const { mutate, isLoading } = useCreateRequestMutation({
    onSuccess: () => {
      void router.push("/requests");
    },
  });

  return (
    <>
      <Switch />
      <div className="flex flex-1">
        <form
          className="m-auto w-[280px]"
          onSubmit={handleSubmit((form) =>
            mutate({
              ...form,
              image: image as string,
              community_id: communityId as string,
              date_need: range?.from as string | undefined,
              date_return: range?.to as string | undefined,
            })
          )}
        >
          <ImageInput
            image={image}
            setImage={setImage}
            type={ImageInputTypeEnum.ITEM}
            {...register("image")}
            errText={errors.image}
          />
          <Input className="mb-2" errText={errors.title} placeholder="Title" {...register("title")} />
          <Input errText={errors.description} placeholder="Description" {...register("description")} />
          <p className="mb-4 text-sm">When do you need the item?</p>
          <Select values={TIME_FRAME} {...register("time_frame")} />
          {watch("time_frame") === TimeFrameEnum.SPECIFIC && (
            <>
              <p className="mb-2 mt-4 text-sm">By when do you need it?</p>
              <DayPicker mode="range" onSelect={setRange} selected={range} style={{ margin: 0, padding: 0 }} />
            </>
          )}
          <Button className="mt-4" isLoading={isLoading} type="submit">
            Create
          </Button>
        </form>
      </div>
    </>
  );
};

export default CreateRequest;
