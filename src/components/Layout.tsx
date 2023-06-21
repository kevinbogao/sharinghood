import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { FC, PropsWithChildren } from "react";
import { useEffect } from "react";

import { useLogoutMutation } from "../hooks/api/AuthHooks";
import { useCommunitiesQuery } from "../hooks/api/CommunityHooks";
import { useSession } from "../hooks/useSession";
import { useCommunityIdStore } from "../lib/client/Store";
import { Icon } from "./Icon";
import { NavLink } from "./NavLink";
import { Toasts } from "./Toasts";

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useSession();
  const { communityId, setCommunityId } = useCommunityIdStore((store) => ({
    communityId: store.communityId,
    setCommunityId: store.setCommunityId,
  }));

  const { mutate } = useLogoutMutation({
    onSuccess: async () => {
      setCommunityId();
      await router.replace("/login");
    },
  });
  const { data: communitiesData } = useCommunitiesQuery({ enabled: isAuthenticated && !isLoading });

  const selectedCommunity = communitiesData?.communities.find((community) => community.id === communityId);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (router.pathname.startsWith("/dashboard") && !user?.is_admin) {
      void router.replace("/items");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, router.pathname, user?.is_admin]);

  const onClick = (): void => {
    setCommunityId();
    void router.push("/communities");
  };

  const notificationCount =
    communitiesData?.communities.reduce((acc, { notification_count }) => acc + notification_count, 0) ?? 0;

  const hasOtherNotifications = Boolean(
    communitiesData?.communities.find(({ id, notification_count }) => id !== communityId && notification_count > 0)
  );

  return (
    <>
      <Head>
        <title>{notificationCount > 0 ? `(${notificationCount}) Sharinghood` : "Sharinghood"}</title>
        <meta content="initial-scale=1.0, width=device-width" name="viewport" />
      </Head>
      <div className="flex h-screen flex-col">
        <div className="flex h-16 justify-between py-1 align-middle shadow-md">
          <div className="flex-1" />
          {selectedCommunity ? (
            <div className="my-auto flex items-center">
              {hasOtherNotifications ? <div className="mr-4 h-2.5 w-2.5 rounded-full bg-red-500" /> : null}
              <Link className="my-auto text-2xl" href="/items">
                {selectedCommunity.name}
              </Link>
              <button className="ml-3" onClick={onClick} type="button">
                <Icon className="w-3" type="caret" />
              </button>
            </div>
          ) : (
            <Link className="my-auto text-2xl" href={isAuthenticated ? "/communities" : "/"}>
              Sharinghood
            </Link>
          )}
          <div className="mr-4 flex flex-1 items-center justify-end">
            {isAuthenticated ? (
              <>
                {user?.is_admin ? (
                  <NavLink href="/dashboard">
                    <Icon className="h-5" type="dashboard" />
                  </NavLink>
                ) : null}
                <NavLink href="/account">
                  <Icon className="h-5" type="account" />
                </NavLink>
                <NavLink href="/notifications">
                  <Icon className="h-5" type="notification" />
                  {(selectedCommunity?.notification_count ?? 0) > 0 && (
                    <div className="right-19 absolute top-4 aspect-square w-2.5 rounded-full bg-red-500" />
                  )}
                </NavLink>
                <button
                  className="flex aspect-square h-9 items-center justify-center rounded-full hover:bg-stone-100"
                  onClick={() => mutate()}
                  type="button"
                >
                  <Icon className="w-4.5" type="logout" />
                </button>
              </>
            ) : (
              <Link className="text-md my-auto hover:underline" href="/login">
                Login
              </Link>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
      </div>
      <Toasts />
    </>
  );
};
