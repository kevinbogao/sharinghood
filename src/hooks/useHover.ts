import type { MutableRefObject } from "react";
import { useEffect, useRef, useState } from "react";

interface IUseHoverResult<T> {
  ref: MutableRefObject<T | null>;
  isHover: boolean;
}

export const useHover = <T extends HTMLElement = HTMLElement>(): IUseHoverResult<T> => {
  const ref = useRef<T>(null);
  const [isHover, setIsHover] = useState(false);

  const handleMouseEnter = (): void => setIsHover(true);
  const handleMouseLeave = (): void => setIsHover(false);

  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener("mouseenter", handleMouseEnter);
      node.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        node.addEventListener("mouseenter", handleMouseEnter);
        node.addEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [ref]);

  return { ref, isHover };
};
