import { TimeFrameEnum } from "@prisma/client";
import { useRouter } from "next/router";
import type { FC } from "react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";

import { useCreateBookingMutation } from "../../hooks/api/BookingHooks";
import { useForm } from "../../hooks/useForm";
import { useCommunityIdStore } from "../../lib/client/Store";
import { TIME_FRAME } from "../../lib/db/enums";
import { createBookingBodySchema } from "../../lib/schema/bookings";
import { Button } from "../Button";
import { Select } from "../Select";
import { Modal } from ".";

interface IBookingModal {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  postId: string;
}

export const BookingModal: FC<IBookingModal> = ({ isModalOpen, setIsModalOpen, postId }) => {
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>();
  const { communityId } = useCommunityIdStore((store) => ({ communityId: store.communityId }));
  const { register, handleSubmit, watch } = useForm(createBookingBodySchema.pick({ time_frame: true }));

  const { mutate, isLoading } = useCreateBookingMutation({
    onSuccess: ({ notification_id }) => void router.push(`/notifications/${notification_id}`),
  });

  return (
    <Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
      <form
        onSubmit={handleSubmit((form) => {
          mutate({
            time_frame: form.time_frame,
            date_need: range?.from as string | undefined,
            date_return: range?.to as string | undefined,
            post_id: postId,
            community_id: communityId ?? "",
          });
        })}
      >
        <p className="mb-4 text-sm">When do you need the item?</p>
        <Select values={TIME_FRAME} {...register("time_frame")} />
        {watch("time_frame") === TimeFrameEnum.SPECIFIC && (
          <>
            <p className="mb-2 mt-4 text-sm">By when do you need it?</p>
            <DayPicker mode="range" onSelect={setRange} selected={range} style={{ margin: 0, padding: 0 }} />
          </>
        )}
        <Button className="mt-4 w-[280px]" isLoading={isLoading} type="submit">
          Book
        </Button>
      </form>
    </Modal>
  );
};
