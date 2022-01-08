import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";
import { useForm, FormProvider } from "react-hook-form";
import moment from "moment";
import DatePicker from "../../components/DatePicker";
import { queries, mutations } from "../../lib/gql";
import { TimeFrame } from "../../lib/enums";
import { communityIdVar } from "../_app";
import ImageInput from "../../components/ImageInput";
import { Container, Loader, InlineError } from "../../components/Container";
import { ITEMS_LIMIT } from "../../lib/const";
import type {
  CreateRequestData,
  CreateRequestVars,
  PaginatedRequestsData,
  PaginatedRequestsVars,
} from "../../lib/types";

interface CreateRequestInput {
  image?: string;
  title: string;
  desc: string;
  timeFrame: TimeFrame;
  res?: any;
}

export default function CreateRequest() {
  const router = useRouter();
  const methods = useForm<CreateRequestInput>();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = methods;
  const [image, setImage] = useState<string | undefined>(undefined);
  const [dateNeed, setDateNeed] = useState(moment());
  const [dateReturn, setDateReturn] = useState(moment());
  const [createRequest, { loading: mutationLoading }] = useMutation<
    CreateRequestData,
    CreateRequestVars
  >(mutations.CREATE_REQUEST, {
    update(cache, { data }) {
      const communityId = communityIdVar()!;
      const requestsCache = cache.readQuery<
        PaginatedRequestsData,
        PaginatedRequestsVars
      >({
        query: queries.GET_PAGINATED_REQUESTS,
        variables: { offset: 0, limit: ITEMS_LIMIT, communityId },
      });
      if (requestsCache) {
        cache.writeQuery<PaginatedRequestsData, PaginatedRequestsVars>({
          query: queries.GET_PAGINATED_REQUESTS,
          variables: { offset: 0, limit: ITEMS_LIMIT, communityId },
          data: {
            paginatedRequests: {
              ...requestsCache.paginatedRequests,
              requests: [
                data!.createRequest,
                ...requestsCache.paginatedRequests.requests,
              ],
            },
          },
        });
      }
      router.push("/requests");
    },
    onError() {
      setError("res", {
        message:
          "We are experiencing difficulties right now :( Please try again later",
      });
    },
  });

  return (
    <Container>
      <div className="request-control">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit((form) => {
              if (Object.keys(errors).length === 0 && image) {
                createRequest({
                  variables: {
                    requestInput: {
                      title: form.title,
                      desc: form.desc,
                      image,
                      timeFrame: form.timeFrame,
                      ...(form.timeFrame === TimeFrame.SPECIFIC && {
                        dateNeed: moment(dateNeed).toDate(),
                        dateReturn: moment(dateReturn).toDate(),
                      }),
                    },
                    communityId: communityIdVar()!,
                  },
                });
              }
            })}
          >
            <ImageInput type="item" image={image} setImage={setImage} />
            {errors.image && <InlineError text={errors.image.message!} />}
            <input
              className="main-input"
              placeholder="Title"
              {...register("title", {
                required: "Please enter a title",
              })}
            />
            {errors.title && <InlineError text={errors.title.message!} />}
            <input
              className="main-input"
              placeholder="Description"
              {...register("desc", {
                required: "Please enter a description",
              })}
            />
            {errors.desc && <InlineError text={errors.desc.message!} />}
            <DatePicker
              dateNeed={dateNeed}
              setDateNeed={setDateNeed}
              dateReturn={dateReturn}
              setDateReturn={setDateReturn}
            />
            {errors.res && <InlineError text={errors.res.message!} />}
            <button className="main-btn" type="submit">
              {mutationLoading ? <Loader /> : "Request"}
            </button>
          </form>
        </FormProvider>
        <style jsx>
          {`
            @import "../index.scss";

            .request-control {
              margin: auto;
              display: flex;
              align-items: center;
              justify-content: center;

              @include sm {
                max-width: 300px;
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
              }
            }
          `}
        </style>
      </div>
    </Container>
  );
}
