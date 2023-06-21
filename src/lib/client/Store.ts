import { createId } from "@paralleldrive/cuid2";
import { create } from "zustand";

import type { IToast } from "../../components/Toasts";
import type { TCreateCommunityBody } from "../schema/communities";
import type { TKeysToCamelCase } from "../utils/types";
import { appConfig } from "./appConfig";
import { getCookie, removeCookie, setCookie } from "./utils";

interface IToastStore {
  toasts: Array<IToast>;
  addToast: (toast: Omit<IToast, "id">) => void;
  removeToast: (id: IToast["id"]) => void;
}

export const useToastStore = create<IToastStore>((set) => ({
  toasts: [],
  addToast: (toast): void => set(({ toasts }) => ({ toasts: [{ ...toast, id: createId() }, ...toasts] })),
  removeToast: (idToRemove): void => set(({ toasts }) => ({ toasts: toasts.filter(({ id }) => id !== idToRemove) })),
}));

type TCommunityInput = TKeysToCamelCase<TCreateCommunityBody>;

interface ICommunityInputStore {
  communityInput?: TCommunityInput;
  setCommunityInput: (communityInput?: TCommunityInput) => void;
}

export const useCommunityInputStore = create<ICommunityInputStore>((set) => ({
  communityInput: undefined,
  setCommunityInput: (community): void => set(() => ({ communityInput: community })),
}));

interface ICommunityIdStore {
  communityId: string | undefined;
  setCommunityId: (communityId?: string) => void;
}

export const useCommunityIdStore = create<ICommunityIdStore>((set) => ({
  communityId: getCookie(appConfig.cookieKeys.communityId),
  setCommunityId: (communityId): void =>
    set(() => {
      if (!communityId) {
        removeCookie(appConfig.cookieKeys.communityId);
        return { communityId: undefined };
      }
      setCookie(appConfig.cookieKeys.communityId, communityId);
      return { communityId };
    }),
}));
