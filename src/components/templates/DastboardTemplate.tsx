import Link from "next/link";
import { useRouter } from "next/router";
import type { FC, PropsWithChildren, ReactElement } from "react";

import { useCommunityStatsQuery } from "../../hooks/api/AdminHooks";
import { capitalise } from "../../lib/utils/string";

const links = [{ entity: "users" }, { entity: "posts" }, { entity: "requests" }, { entity: "bookings" }] as const;

interface IDashboardTemplate {
  communityId?: string;
}

export const DashboardTemplate: FC<PropsWithChildren<IDashboardTemplate>> = ({ communityId, children }) => {
  const { pathname } = useRouter();
  const { data } = useCommunityStatsQuery(communityId as string, { enabled: Boolean(communityId) });

  const renderTab = (entity: string): ReactElement => {
    const isCurrentEntity = pathname.split("/").pop() === entity;

    if (isCurrentEntity) {
      return (
        <Link className="flex-1 bg-white py-1 text-center" href={`/dashboard/${communityId}/${entity}`} key={entity}>
          <p className="font-semibold">Total {capitalise(entity)}</p>
          <p className="font-semibold">{data?.[`${entity}_count`]}</p>
        </Link>
      );
    }

    return (
      <Link className="flex-1 py-1 text-center" href={`/dashboard/${communityId}/${entity}`} key={entity}>
        <p className="text-white">Total {capitalise(entity)}</p>
        <p className="text-white">{data?.[`${entity}_count`]}</p>
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col">
        <div className="bg-black">
          <p className="mx-auto mt-2 mb-4 text-center text-xl font-medium text-white">{data?.community.name}</p>
          <div className="mx-auto mt-2 flex w-[1080px] justify-evenly">
            {data ? links.map(({ entity }) => renderTab(entity)) : null}
          </div>
        </div>
        <div className="mx-auto flex w-[1080px]">{children}</div>
      </div>
    </div>
  );
};
