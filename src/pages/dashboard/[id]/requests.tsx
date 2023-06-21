import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { object } from "zod";

import type { TColumn } from "../../../components/Table";
import { Table } from "../../../components/Table";
import { DashboardTemplate } from "../../../components/templates/DastboardTemplate";
import { useCommunityRequestsQuery } from "../../../hooks/api/AdminHooks";
import { useRouterQuery } from "../../../hooks/useRouterQuery";
import { cuidSchema } from "../../../lib/schema";
import { formatDate } from "../../../lib/utils/date";
import type { TGetCommunityRequestsResponse } from "../../api/admin/stats/[id]/requests";

type TRow = TGetCommunityRequestsResponse["requests"][number];

const DashboardRequests: NextPage = () => {
  const { query } = useRouterQuery(object({ id: cuidSchema }));
  const { data } = useCommunityRequestsQuery(query?.id as string, { enabled: Boolean(query?.id) });

  const columns: Array<TColumn<TRow>> = [
    { key: "id", label: "ID", render: (id) => `...${id.slice(id.length - 10)}` },
    { key: "title", label: "Name" },
    { key: "time_frame", label: "Time Frame" },
    { key: "date_need", label: "Date Need", render: (value) => (value ? formatDate(value) : "-") },
    {
      key: "date_return",
      label: "Date Return",
      render: (value) => (value ? formatDate(value) : "-"),
    },
    {
      key: "image_url",
      label: "Image",
      render: (image_url) => (
        <div className="relative m-auto aspect-square h-9">
          <Image alt="Image of an item" layout="fill" objectFit="cover" src={image_url} />
        </div>
      ),
    },
    {
      key: "creator_id",
      label: "Creator ID",
      render: (creator_id) => (
        <Link className="hover:underline" href={`/dashboard/${query?.id}/users`}>{`...${creator_id.slice(
          creator_id.length - 10
        )}`}</Link>
      ),
    },
  ];

  return (
    <DashboardTemplate communityId={query?.id}>
      <Table<TRow> columns={columns} rows={data?.requests ?? []} />
    </DashboardTemplate>
  );
};

export default DashboardRequests;
