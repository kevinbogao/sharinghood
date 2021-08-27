import { ChangeEvent } from "react";
import uploadImg from "../assets/images/upload.png";
import profileImg from "../assets/images/profile-img.png";

interface ImageInputProps {
  image: string | null;
  setImage(img: string): void;
  isItem: boolean;
}

export default function ImageInput({
  image,
  setImage,
  isItem,
}: ImageInputProps) {
  return (
    <div className={isItem ? "item-image-input" : "user-image-input"}>
      <label htmlFor="file-input">
        <img
          alt="profile pic"
          src={image || (isItem ? uploadImg : profileImg)}
        />
      </label>
      <input
        id="file-input"
        className="FileInput"
        type="file"
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
          input {
            display: none;
          }

          .item-image-input {
            img {
              cursor: pointer;
              margin-top: 30px;
              border-radius: 4px;
              width: 148px;
              height: 180px;
              object-fit: contain;
              box-shadow: 1px 1px 1px 1px #eeeeee;
            }
          }

          .user-image-input {
            img {
              cursor: pointer;
              height: 100px;
              width: 100px;
              border-radius: 50%;
              box-shadow: 1px 1px 1px 1px #eeeeee;
            }
          }
        `}
      </style>
    </div>
  );
}
