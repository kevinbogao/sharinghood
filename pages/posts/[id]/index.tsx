import { useState } from "react";
import { useRouter } from "next/router";
import {
  useQuery,
  useMutation,
  useReactiveVar,
  NetworkStatus,
} from "@apollo/client";
import { useForm, FormProvider } from "react-hook-form";
import moment from "moment";
import Modal from "react-modal";
import { TimeFrame, BookingStatus, NotificationType } from "../../../lib/enums";
import { queries, mutations } from "../../../lib/gql";
import { communityIdVar, tokenPayloadVar } from "../../_app";
import { Container, SVG, Icon, Loader } from "../../../components/Container";
import DatePicker from "../../../components/DatePicker";
import ItemDetails from "../../../components/ItemDetails";
import { THREADS_LIMIT } from "../../../lib/const";
import type {
  PostDetailsData,
  PostDetailsVars,
  CreateNotificationData,
  CreateNotificationVars,
} from "../../../lib/types";

const CONDITIONS: Record<string, string> = {
  new: "New",
  used: "Used but good",
  damaged: "Used but little damaged",
};

const CONDITION_ICONS: Record<string, Icon> = {
  new: "doubleCheck",
  used: "check",
  damaged: "exclamationTriangle",
};

interface PostDetailsInput {
  timeFrame: TimeFrame;
}

export default function PostDetails() {
  const router = useRouter();
  const methods = useForm<PostDetailsInput>();
  const communityId = useReactiveVar(communityIdVar);
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const [dateNeed, setDateNeed] = useState(moment());
  const [dateReturn, setDateReturn] = useState(moment());
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const { loading, error, data, fetchMore, networkStatus } = useQuery<
    PostDetailsData,
    PostDetailsVars
  >(queries.GET_POST_DETAILS, {
    notifyOnNetworkStatusChange: true,
    skip: !router.query.id || !communityId,
    variables: {
      postId: router.query.id?.toString()!,
      communityId: communityId!,
      threadsOffset: 0,
      threadsLimit: THREADS_LIMIT,
    },
  });

  const [createNotification, { loading: mutationLoading }] = useMutation<
    CreateNotificationData,
    CreateNotificationVars
  >(mutations.CREATE_NOTIFICATION, {
    onCompleted({ createNotification }) {
      if (createNotification.id)
        router.push(`/notifications/${createNotification.id}`);
    },
    onError({ message }) {
      console.log(message);
    },
  });

  return (
    <Container
      loading={loading && networkStatus === NetworkStatus.loading}
      error={error}
    >
      {data?.post && tokenPayload && (
        <div className="item-control">
          <ItemDetails
            type="post"
            item={data.post}
            userId={tokenPayload.userId}
            community={data.community!}
            fetchMore={fetchMore}
            networkStatus={networkStatus}
          >
            <div className="item-desc">
              <h3>{data.post.title}</h3>
              <p className="main-p">{data.post.desc}</p>
              <div className="item-misc">
                <SVG
                  className="condition-icon"
                  icon={CONDITION_ICONS[data.post.condition]}
                />
                <span>{CONDITIONS[data.post.condition]}</span>
              </div>
              {data.post.isGiveaway && (
                <div className="item-misc">
                  <SVG className="condition-icon" icon="gifts" />
                  <span>This is a give away</span>
                </div>
              )}
              {data.post.creator?.id === tokenPayload.userId ? (
                <button
                  type="button"
                  className="main-btn item"
                  onClick={() => router.push(`/posts/${router.query.id!}/edit`)}
                >
                  Edit
                </button>
              ) : (
                <button
                  type="button"
                  className="main-btn item"
                  onClick={() => setIsBookingOpen(true)}
                >
                  Book
                </button>
              )}
            </div>
          </ItemDetails>
          <Modal
            className="react-modal"
            isOpen={isBookingOpen}
            onRequestClose={() => setIsBookingOpen(false)}
          >
            <FormProvider {...methods}>
              <DatePicker
                dateNeed={dateNeed}
                setDateNeed={setDateNeed}
                dateReturn={dateReturn}
                setDateReturn={setDateReturn}
              />
              <button
                className="main-btn modal"
                type="submit"
                onClick={methods.handleSubmit((form) => {
                  createNotification({
                    variables: {
                      notificationInput: {
                        bookingInput: {
                          postId: router.query.id!.toString(),
                          timeFrame: form.timeFrame,
                          communityId: communityId!,
                          status: BookingStatus.PENDING,
                          ...(form.timeFrame === TimeFrame.SPECIFIC && {
                            dateNeed: moment(dateNeed).toDate(),
                            dateReturn: moment(dateReturn).toDate(),
                          }),
                        },
                        type: NotificationType.BOOKING,
                        recipientId: data.post.creator.id,
                        communityId: communityId!,
                      },
                    },
                  });
                })}
              >
                {mutationLoading ? <Loader /> : "Borrow item"}
              </button>
            </FormProvider>
            <button
              className="main-btn modal grey"
              type="button"
              onClick={() => setIsBookingOpen(false)}
            >
              Close
            </button>
          </Modal>
          <style jsx>
            {`
              @import "../../index.scss";

              .item-control {
                margin: 30px auto;
                width: 80vw;
                max-width: $xl-max-width;

                .main-btn {
                  &.item {
                    margin: 20px 0;
                  }
                }

                .main-p {
                  margin-left: 0;
                }

                .item-desc {
                  margin: 0 20px 0 40px;

                  h3 {
                    font-size: 26px;
                    color: $black;
                    margin: 0;
                  }

                  @include lg {
                    margin: 0 0 0 40px;
                  }

                  @include md {
                    margin: 20px 0 0 30px;
                  }

                  @include sm {
                    margin: 20px 0 0 0;
                    width: 100%;
                  }

                  .item-misc {
                    display: flex;
                    align-items: center;
                    margin: 5px 0;

                    span {
                      margin-left: 10px;
                      color: $grey-300;
                      font-size: 18px;
                    }
                  }
                }
              }
            `}
          </style>
          <style jsx global>
            {`
              @import "../../index.scss";

              .condition-icon {
                color: $grey-300;
                width: 20px;
              }
            `}
          </style>
        </div>
      )}
    </Container>
  );
}

Modal.setAppElement("#__next");
