import { format } from "date-fns";
import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { object } from "zod";

import type { TColumn } from "../../../components/Table";
import { Table } from "../../../components/Table";
import { DashboardTemplate } from "../../../components/templates/DastboardTemplate";
import { useCommunityPostsQuery } from "../../../hooks/api/AdminHooks";
import { useRouterQuery } from "../../../hooks/useRouterQuery";
import { cuidSchema } from "../../../lib/schema";
import type { TGetCommunityPostsResponse } from "../../api/admin/stats/[id]/posts";

type TRow = TGetCommunityPostsResponse["posts"][number];

const DashboardPosts: NextPage = () => {
  const { query } = useRouterQuery(object({ id: cuidSchema }));
  const { data } = useCommunityPostsQuery(query?.id as string, { enabled: Boolean(query?.id) });

  const columns: Array<TColumn<TRow>> = [
    { key: "id", label: "ID", render: (id) => `...${id.slice(id.length - 10)}` },
    { key: "title", label: "Name" },
    { key: "condition", label: "Condition" },
    { key: "is_giveaway", label: "Giveaway" },
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
    {
      key: "created_at",
      label: "Created at",
      render: (value) => format(new Date(value), "dd.MM.yy"),
    },
  ];

  return (
    <DashboardTemplate communityId={query?.id}>
      <Table<TRow> columns={columns} rows={data?.posts ?? []} />
    </DashboardTemplate>
  );
};

export default DashboardPosts;
