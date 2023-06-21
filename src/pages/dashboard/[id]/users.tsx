import { format } from "date-fns";
import type { NextPage } from "next";
import Image from "next/image";
import { object } from "zod";

import type { TColumn } from "../../../components/Table";
import { Table } from "../../../components/Table";
import { DashboardTemplate } from "../../../components/templates/DastboardTemplate";
import { useCommunityUsersQuery } from "../../../hooks/api/AdminHooks";
import { useRouterQuery } from "../../../hooks/useRouterQuery";
import { appConfig } from "../../../lib/client/appConfig";
import { cuidSchema } from "../../../lib/schema";
import type { TGetCommunityUsersResponse } from "../../api/admin/stats/[id]/users";

type TRow = TGetCommunityUsersResponse["users"][number];

const columns: Array<TColumn<TRow>> = [
  { key: "id", label: "ID", render: (id) => `...${id.slice(id.length - 10)}` },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  {
    key: "image_url",
    label: "Image",
    render: (image_url) => (
      <div className="relative m-auto aspect-square h-9">
        <Image
          alt="profile pic"
          layout="fill"
          objectFit="cover"
          src={image_url ?? appConfig.imagePlaceholderPath.profile}
        />
      </div>
    ),
  },
  {
    key: "created_at",
    label: "Created at",
    render: (value) => format(new Date(value), "dd.MM.yy"),
  },
  {
    key: "last_login",
    label: "Last login",
    render: (value) => (value ? format(new Date(value), "dd.MM.yy") : "-"),
  },
];

const DashboardCommunityUsers: NextPage = () => {
  const { query } = useRouterQuery(object({ id: cuidSchema }));
  const { data } = useCommunityUsersQuery(query?.id as string, { enabled: Boolean(query?.id) });

  return (
    <DashboardTemplate communityId={query?.id}>
      <Table<TRow> columns={columns} rows={data?.users ?? []} />
    </DashboardTemplate>
  );
};

export default DashboardCommunityUsers;
