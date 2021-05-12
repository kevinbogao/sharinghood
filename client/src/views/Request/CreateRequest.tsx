import { useState, ChangeEvent } from "react";
import { History } from "history";
import { useMutation } from "@apollo/client";
import moment from "moment";
import DatePicker from "../../components/DatePicker";
import InlineError from "../../components/InlineError";
import Spinner from "../../components/Spinner";
import uploadImg from "../../assets/images/upload.png";
import { queries, mutations } from "../../utils/gql";
import { typeDefs } from "../../utils/typeDefs";
import { validateForm, FormError } from "../../utils/helpers";

interface CreateRequestProps {
  communityId: string;
  history: History;
}

export default function CreateRequest({
  communityId,
  history,
}: CreateRequestProps) {
  let title: HTMLInputElement | null;
  let desc: HTMLInputElement | null;
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<FormError>({});
  const [dateType, setDateType] = useState(0);
  const [dateNeed, setDateNeed] = useState(moment());
  const [dateReturn, setDateReturn] = useState(moment());

  const [createRequest, { loading: mutationLoading }] = useMutation(
    mutations.CREATE_REQUEST,
    {
      update(cache, { data: { createRequest } }) {
        // Fetch requests from cache
        const requestsData = cache.readQuery<typeDefs.RequestsData>({
          query: queries.GET_REQUESTS,
          variables: { communityId },
        });

        // Update cached requests if it exists
        if (requestsData) {
          cache.writeQuery({
            query: queries.GET_REQUESTS,
            variables: { communityId },
            data: { requests: [createRequest, ...requestsData.requests] },
          });
        }
        history.push("/requests");
      },
      onError: () => {
        setError({
          res: "We are experiencing difficulties right now :( Please try again later",
        });
      },
    }
  );

  return (
    <div className="request-control">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validateForm({ title, desc }, image);
          setError(errors);
          if (Object.keys(errors).length === 0 && title && desc && image) {
            createRequest({
              variables: {
                requestInput: {
                  title: title.value,
                  desc: desc.value,
                  image,
                  dateType,
                  ...(dateType === 2 && { dateNeed, dateReturn }),
                },
                communityId,
              },
            });
          }
        }}
      >
        <div className="image-upload">
          <label htmlFor="file-input">
            <img alt="profile pic" src={image || uploadImg} />
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
        </div>
        {error.image && <InlineError text={error.image} />}
        <input
          className="main-input"
          name="title"
          placeholder="Title"
          ref={(node) => (title = node)}
        />
        {error.title && <InlineError text={error.title} />}
        <input
          className="main-input"
          placeholder="Description"
          ref={(node) => (desc = node)}
        />
        {error.desc && <InlineError text={error.desc} />}
        {error.descExists && <InlineError text={error.descExists} />}
        <DatePicker
          dateType={dateType}
          dateNeed={dateNeed}
          dateReturn={dateReturn}
          setDateType={setDateType}
          setDateNeed={setDateNeed}
          setDateReturn={setDateReturn}
        />
        {error.res && <InlineError text={error.res} />}
        <button className="main-btn" type="submit">
          Request
        </button>
      </form>
      {mutationLoading && <Spinner isCover />}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .request-control {
            margin: auto;
            display: flex;
            align-items: center;
            justify-content: center;

            @include sm {
              max-width: 300px;
            }

            .image-upload > input {
              display: none;
            }

            img {
              margin-top: 30px;
              border-radius: 4px;
              width: 148px;
              height: 180px;
              object-fit: contain;
              box-shadow: 1px 1px 1px 1px #eeeeee;
            }

            .main-input {
              &.date {
                margin: 0 auto;
              }
            }

            .main-p {
              max-width: 280px;
              font-size: 19px;
              margin: 20px 0;
            }

            .main-btn {
              margin: 40px 0 30px 0;
              display: block;
            }
          }
        `}
      </style>
    </div>
  );
}
