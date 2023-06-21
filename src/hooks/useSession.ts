import { useMemo } from "react";

import type { TGetSessionResponse } from "../pages/api/auth/session";
import { useSessionQuery } from "./api/AuthHooks";

interface IUseSessionResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: TGetSessionResponse["user"];
}

export const useSession = (): IUseSessionResult => {
  const { data, isLoading } = useSessionQuery();

  const isAuthenticated = useMemo(() => (isLoading ? true : Boolean(data?.user)), [data?.user, isLoading]);

  return { user: data?.user, isAuthenticated, isLoading };
};
