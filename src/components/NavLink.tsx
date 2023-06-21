import Link from "next/link";
import { useRouter } from "next/router";
import type { FC, PropsWithChildren } from "react";

interface INavLink {
  href: string;
}

export const NavLink: FC<PropsWithChildren<INavLink>> = ({ href, children }) => {
  const { pathname } = useRouter();
  const [, hrefEntity] = href.split("/");
  const [, pathEntity] = pathname.split("/");
  const isActive = hrefEntity === pathEntity;

  return (
    <div className="mr-4">
      <Link className="flex aspect-square h-9 items-center justify-center rounded-full hover:bg-stone-100" href={href}>
        {children}
      </Link>
      {isActive ? <div className="mx-auto -mb-1 h-1 w-2.5 rounded-full bg-black" /> : null}
    </div>
  );
};
