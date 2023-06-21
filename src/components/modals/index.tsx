import type { FC, PropsWithChildren } from "react";
import { useCallback, useEffect, useRef } from "react";

interface IModal {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
}

export const Modal: FC<PropsWithChildren<IModal>> = ({ isModalOpen, setIsModalOpen, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    ({ target }: MouseEvent) => {
      if (ref.current && !ref.current.contains(target as Node)) {
        setIsModalOpen(false);
      }
    },
    [setIsModalOpen]
  );

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [handleClickOutside]);

  if (!isModalOpen) {
    return null;
  }

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-md bg-white p-5 shadow-md"
      ref={ref}
    >
      {children}
    </div>
  );
};
