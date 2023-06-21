import Link from "next/link";
import { useRouter } from "next/router";
import type { FC } from "react";

const links = [
  { href: "/items", lable: "Items" },
  { href: "/requests", lable: "Requests" },
  { href: "/items/share", lable: "Share" },
  { href: "/requests/create", lable: "Request" },
] as const;

export const Switch: FC = () => {
  const router = useRouter();

  return (
    <div className="my-7 flex w-auto justify-center">
      {links.map(({ href, lable }, idx) => (
        <div
          className={`flex w-28 justify-center rounded-full align-middle hover:cursor-pointer ${
            href === router.pathname ? "bg-black" : "hover:shadow-md"
          } ${idx > 0 ? "ml-3" : ""}`}
          key={lable}
        >
          <Link
            className={`py-2 text-sm font-medium ${href === router.pathname ? "text-white" : "text-black"}`}
            href={href}
          >
            {lable}
          </Link>
        </div>
      ))}
    </div>
  );
};
