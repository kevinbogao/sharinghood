import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";

import type { TColumn } from "../../components/Table";
import { Table } from "../../components/Table";
import { useAdminCommunitiesQuery, useAdminStatsQuery } from "../../hooks/api/AdminHooks";
import { apiRequestSSR } from "../../lib/client/apiRequest";
import { capitalise, words } from "../../lib/utils/string";
import type { TGetAdminStatsResponse } from "../api/admin/stats";
import type { TGetAdminCommunitiesResponse } from "../api/admin/stats/communities";

interface IPostResponse {
  stats: TGetAdminStatsResponse | null;
  communities: TGetAdminCommunitiesResponse | null;
}

export const getServerSideProps: GetServerSideProps<IPostResponse> = async ({ req }) => {
  const [stats, communities] = await Promise.all([
    apiRequestSSR<TGetAdminStatsResponse>(req, "/admin/stats"),
    apiRequestSSR<TGetAdminCommunitiesResponse>(req, "/admin/stats/communities"),
  ]);
  return { props: { stats, communities } };
};

type TRow = TGetAdminCommunitiesResponse["communities"][number];

export const columns: Array<TColumn<TRow>> = [
  {
    key: "id",
    label: "ID",
    render: (id) => (
      <Link className="group-hover:underline" href={`/dashboard/${id}/users`}>
        {`...${id.slice(id.length - 10)}`}
      </Link>
    ),
  },
  { key: "name", label: "Name" },
  { key: "code", label: "Code" },
  { key: "users_count", label: "Users Count" },
  { key: "posts_count", label: "Posts Count" },
  { key: "requests_count", label: "Requests Count" },
  { key: "bookings_count", label: "Bookings Count" },
];

const Dashboard: NextPage<IPostResponse> = ({ stats, communities }) => {
  const { data: statsData } = useAdminStatsQuery({ ...(stats && { initialData: stats }) });
  const { data: communitiesData } = useAdminCommunitiesQuery({ ...(communities && { initialData: communities }) });

  return (
    <div className="flex h-full flex-col">
      <Link className="mt-4.5 absolute right-4 text-white underline" href="/dashboard/openapi">
        API Docs
      </Link>
      <div className="flex flex-col">
        <div className="bg-black">
          <div className="mx-auto my-2 flex w-[1080px] justify-evenly">
            {statsData
              ? Object.entries(statsData).map(([key, value]) => (
                  <div className="text-center" key={key}>
                    <p className="text-white">Total {capitalise(words(key)[0] ?? "")}</p>
                    <p className="text-white">{value}</p>
                  </div>
                ))
              : null}
          </div>
        </div>
        <div className="mx-auto flex w-[1080px]">
          <Table<TRow> columns={columns} rows={communitiesData?.communities ?? []} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
