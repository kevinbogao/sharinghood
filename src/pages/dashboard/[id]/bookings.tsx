import { format } from "date-fns";
import type { NextPage } from "next";
import Link from "next/link";
import { object } from "zod";

import type { TColumn } from "../../../components/Table";
import { Table } from "../../../components/Table";
import { DashboardTemplate } from "../../../components/templates/DastboardTemplate";
import { useCommunityBookingsQuery } from "../../../hooks/api/AdminHooks";
import { useRouterQuery } from "../../../hooks/useRouterQuery";
import { cuidSchema } from "../../../lib/schema";
import type { TGetCommunityBookingsResponse } from "../../api/admin/stats/[id]/bookings";

type TRow = TGetCommunityBookingsResponse["bookings"][number];

const DashboardBookings: NextPage = () => {
  const { query } = useRouterQuery(object({ id: cuidSchema }));
  const { data } = useCommunityBookingsQuery(query?.id as string, { enabled: Boolean(query?.id) });

  const columns: Array<TColumn<TRow>> = [
    { key: "id", label: "ID", render: (id) => `...${id.slice(id.length - 10)}` },
    {
      key: "post_id",
      label: "Post ID",
      render: (value) => (
        <Link className="hover:underline" href={`/dashboard/${query?.id}/posts`}>{`...${value.slice(
          value.length - 10
        )}`}</Link>
      ),
    },
    {
      key: "booker_id",
      label: "Booker ID",
      render: (value) => (
        <Link className="hover:underline" href={`/dashboard/${query?.id}/posts`}>{`...${value.slice(
          value.length - 10
        )}`}</Link>
      ),
    },
    { key: "time_frame", label: "Time Frame" },
    { key: "status", label: "Status" },
    { key: "date_need", label: "Date Need", render: (value) => (value ? format(new Date(value), "dd.MM.yy") : "-") },
    {
      key: "date_return",
      label: "Date Return",
      render: (value) => (value ? format(new Date(value), "dd.MM.yy") : "-"),
    },
  ];

  return (
    <DashboardTemplate communityId={query?.id}>
      <Table<TRow> columns={columns} rows={data?.bookings ?? []} />
    </DashboardTemplate>
  );
};

export default DashboardBookings;
