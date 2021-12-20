import { ChangeEvent } from "react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";

type TImage = "user" | "item";

const DEFAULT_IMAGE: Record<TImage, string> = {
  user: "/profile-img.png",
  item: "/upload.png",
};

interface ImageInputProps {
  type: TImage;
  image?: string;
  setImage(image: string): void;
}

export default function ImageInput({ type, image, setImage }: ImageInputProps) {
  const { register } = useFormContext();

  return (
    <>
      <label htmlFor="file-input">
        <div className={`image-input ${type}`}>
          <Image
            alt="profile pic"
            src={image ?? DEFAULT_IMAGE[type]}
            layout="fill"
            objectFit="contain"
          />
        </div>
      </label>
      <input
        id="file-input"
        className="FileInput"
        type="file"
        {...register("image", {
          validate: {
            notNull: () => type === "user" || image !== undefined || "err",
          },
        })}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const reader = new FileReader();
          if (e.currentTarget.files) {
            reader.readAsDataURL(e.currentTarget.files[0]);
            reader.onload = () => {
              setImage(reader.result!.toString());
            };
          }
        }}
      />
      <style jsx>
        {`
          .image-input {
            cursor: pointer;
            position: relative;
          }

          .user {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            box-shadow: 1px 1px 1px 1px #eeeeee;
            overflow: hidden;
          }

          .item {
            border-radius: 4px;
            width: 148px;
            height: 180px;
            box-shadow: 1px 1px 1px 1px #eeeeee;
          }

          input {
            display: none;
          }
        `}
      </style>
    </>
  );
}
