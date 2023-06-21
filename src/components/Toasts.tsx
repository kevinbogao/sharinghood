import type { FC } from "react";
import { useEffect } from "react";

import { appConfig } from "../lib/client/appConfig";
import { ToastTypeEnum } from "../lib/client/enums";
import { useToastStore } from "../lib/client/Store";

export interface IToast {
  id: string;
  type: ToastTypeEnum;
  message: string;
}

const Toast: FC<IToast> = ({ id, type, message }) => {
  const removeToast = useToastStore((state) => state.removeToast);

  const color = type === ToastTypeEnum.ERROR ? "text-red-500" : "text-black";
  const onClick = (): void => removeToast(id);

  useEffect(() => {
    setTimeout(() => removeToast(id), appConfig.toastCloseDelay);
  }, [id, removeToast]);

  return (
    <div className="mb-2.5 w-80 overflow-hidden rounded bg-white py-4 px-5 shadow-md" onClick={onClick}>
      <p className={`text-sm font-normal ${color}`}>{message}</p>
    </div>
  );
};

export const Toasts: FC = () => {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="absolute top-20 right-6">
      {toasts.reverse().map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};
