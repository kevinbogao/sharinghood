import type { ComponentPropsWithoutRef, FC, PropsWithChildren } from "react";
import css from "styled-jsx/css";

import { ColorTypeEnum } from "../lib/client/enums";

interface IButton extends Omit<ComponentPropsWithoutRef<"button">, "type"> {
  type: ComponentPropsWithoutRef<"button">["type"];
  isLoading?: boolean;
  colorType?: ColorTypeEnum;
}

export const Button: FC<PropsWithChildren<IButton>> = ({
  type,
  colorType = ColorTypeEnum.PRIMARY,
  isLoading = false,
  className,
  children,
  ...rest
}) => {
  const buttonClassName =
    colorType === ColorTypeEnum.PRIMARY
      ? "bg-black text-white hover:bg-white hover:text-black"
      : "bg-white text-black hover:bg-black hover:text-white";

  const loaderClassName =
    colorType === ColorTypeEnum.PRIMARY
      ? "after:bg-white group-hover:bg-white after:group-hover:bg-black"
      : "after:bg-black group-hover:bg-black after:group-hover:bg-white";

  return (
    <div className={className}>
      <button
        className={`group my-2 h-10 w-full rounded-md border-2 border-black py-1.5 px-4 ${buttonClassName}`}
        // eslint-disable-next-line react/button-has-type
        type={type}
        {...rest}
      >
        {isLoading ? (
          <span
            className={`loader relative inline-block h-2.5 w-28 overflow-hidden rounded-[5px] after:absolute after:top-0 after:left-0 after:h-2.5 after:w-[40px] after:rounded-[5px] ${loaderClassName}`}
          />
        ) : (
          children
        )}
      </button>
      <style jsx>{styles}</style>
    </div>
  );
};

const styles = css`
  .loader::after {
    content: "";
    animation: hit-zak 0.5s ease-in-out infinite alternate;
  }

  @keyframes hit-zak {
    0% {
      left: 0;
      transform: translateX(-1%);
    }
    100% {
      left: 100%;
      transform: translateX(-99%);
    }
  }
`;
