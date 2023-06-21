import type { FetchNextPageOptions, InfiniteQueryObserverResult } from "@tanstack/react-query";
import Link from "next/link";
import type { FC } from "react";
import { useCallback, useRef } from "react";

import type { TItem } from "./ItemCardTemplate";
import { isRequest, ItemCardTemplate } from "./ItemCardTemplate";

interface IItemsGridTemplate {
  items: Array<TItem> | undefined;
  fetchNextPage: (options?: FetchNextPageOptions) => Promise<InfiniteQueryObserverResult>;
  hasNextPage: boolean | undefined;
  isLoading: boolean;
  emptyDescription: string;
  redirectLink: string;
  redirectLable: string;
}

export const ItemsGridTemplate: FC<IItemsGridTemplate> = ({
  items,
  fetchNextPage,
  hasNextPage,
  isLoading,
  emptyDescription,
  redirectLink,
  redirectLable,
}) => {
  const ref = useRef<any>(null);
  const lastItemId = items?.[items.length - 1]?.id;

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) {
        return;
      }

      if (ref.current) {
        ref.current.disconnect();
      }

      ref.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage) {
          void fetchNextPage();
        }
      });
      if (node) {
        ref.current.observe(node);
      }
    },
    [fetchNextPage, hasNextPage, isLoading]
  );

  if (items?.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <p className="mb-1 text-base">{emptyDescription}</p>
        <Link className="text underline" href={redirectLink}>
          {redirectLable}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-10 grid w-[1080px] grid-cols-4 gap-5">
      {items?.map(({ ...item }) => (
        <div key={item.id} ref={item.id === lastItemId ? lastItemRef : undefined}>
          <ItemCardTemplate href={isRequest(item) ? `/requests/${item.id}` : `/items/${item.id}`} item={item} />
        </div>
      ))}
    </div>
  );
};
