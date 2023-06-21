import type { TimeFrameEnum } from "@prisma/client";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";

import { useSessionQuery } from "../../hooks/api/AuthHooks";
import { useCommunityMember } from "../../hooks/useCommunityMember";
import { TIME_FRAME } from "../../lib/db/enums";
import type { TPost } from "../../lib/schema/posts";
import type { TRequest } from "../../lib/schema/requests";

export type TItem = TPost | TRequest;

interface IItemCardTemplate {
  item: TItem;
  href: string;
}

export const isRequest = (item: TItem): item is TRequest => "time_frame" in item;

export const ItemCardTemplate: FC<IItemCardTemplate> = ({
  href,
  item,
  item: { title, image_url, creator_id, description },
}) => {
  const { data } = useSessionQuery();
  const { getMember } = useCommunityMember();

  const getDescription = (creatorId: string): string | undefined => {
    if (creatorId === data?.user?.id) {
      return "by You";
    }

    const creator = getMember(creatorId);
    if (creator) {
      return `by ${creator.name}`;
    }
  };

  const getRequestTime = (timeFrame: TimeFrameEnum, dateNeed: Date | null): string => {
    if (dateNeed) {
      return format(new Date(dateNeed), "MMM dd");
    }

    return TIME_FRAME[timeFrame];
  };

  return (
    <div className="md-4 overflow-hidden rounded-lg shadow hover:bg-neutral-200">
      <Link href={href}>
        <div className="flex h-[170px] items-center overflow-hidden align-middle">
          <Image alt="A picture of an item" height={500} src={image_url} width={500} />
        </div>
        <div className="p-2">
          <p className="font-medium">{title}</p>
          <div className="flex justify-between ">
            <p className="text-sm">{getDescription(creator_id) ?? description}</p>
            {isRequest(item) ? <p className="text-sm">{getRequestTime(item.time_frame, item.date_need)}</p> : null}
          </div>
        </div>
      </Link>
    </div>
  );
};
