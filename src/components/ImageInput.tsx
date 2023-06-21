import Image from "next/image";
import type { ChangeEvent } from "react";
import { forwardRef } from "react";

import { appConfig } from "../lib/client/appConfig";

export enum ImageInputTypeEnum {
  ITEM = "ITEM",
  PROFILE = "PROFILE",
}

const IMAGE_PLACEHOLDER_PATH: Record<ImageInputTypeEnum, string> = {
  [ImageInputTypeEnum.ITEM]: appConfig.imagePlaceholderPath.item,
  [ImageInputTypeEnum.PROFILE]: appConfig.imagePlaceholderPath.profile,
};

interface IImageInput {
  type: ImageInputTypeEnum;
  errText?: string;
  image: string | undefined;
  setImage: (image?: string) => void;
}

export const ImageInput = forwardRef<HTMLInputElement, IImageInput>(({ type, image, errText, setImage }, ref) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.currentTarget.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.result) {
        setImage(reader.result as string);
      }
    };
  };

  return (
    <div className="py-2">
      <label htmlFor="file-input">
        <Image
          alt="A picture of an item"
          className={
            type === ImageInputTypeEnum.ITEM
              ? "w-34 mb-1 h-40 overflow-hidden rounded-md object-cover shadow"
              : "w-25 mb-1 aspect-square overflow-hidden rounded-full object-cover shadow"
          }
          height={500}
          src={image ?? IMAGE_PLACEHOLDER_PATH[type]}
          width={500}
        />
        <input hidden id="file-input" onChange={onChange} ref={ref} type="file" />
        <p className={`text-[13px] text-red-500 ${errText ? "" : "opacity-0"}`} role="alert">
          {errText ?? "error"}
        </p>
      </label>
    </div>
  );
});

ImageInput.displayName = "ImageInput";
