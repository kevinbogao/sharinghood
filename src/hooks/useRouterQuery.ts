import { useRouter } from "next/router";
import { useMemo } from "react";
import type { ZodTypeAny } from "zod";

import type { TSchemaReturnType } from "../lib/http/types";

interface IUseUrlQueryResult<T> {
  query?: TSchemaReturnType<T>;
}

export const useRouterQuery = <TSchema extends ZodTypeAny>(schema: TSchema): IUseUrlQueryResult<TSchema> => {
  const router = useRouter();
  const query = useMemo(() => {
    const data = schema.safeParse(router.query);
    if (!data.success) {
      return undefined;
    }

    return data.data;
  }, [schema, router.query]);

  return { query: query as TSchemaReturnType<TSchema> | undefined };
};
