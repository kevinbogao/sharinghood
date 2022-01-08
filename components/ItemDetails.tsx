import { useState, ReactNode, Fragment } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMutation, useLazyQuery, useApolloClient } from "@apollo/client";
import Modal from "react-modal";
import moment from "moment";
import { transformImgUrl } from "../lib";
import { queries, mutations } from "../lib/gql";
import { NotificationType } from "../lib/enums";
import { Loader } from "./Container";
import { THREADS_LIMIT } from "../lib/const";
import type {
  Post,
  Request,
  Community,
  CreateThreadData,
  CreateThreadVars,
  FindNotificationData,
  FindNotificationVars,
  CreateNotificationData,
  CreateNotificationVars,
} from "../lib/types";

type ItemType = "post" | "request";

interface Item {
  post: Post;
  request: Request;
}

interface ItemDetailsProps {
  type: ItemType;
  item: Item[ItemType];
  userId: string;
  children: ReactNode;
  community: Community;
  fetchMore(args: any): any;
}

export default function ItemDetails({
  type,
  item,
  userId,
  community,
  children,
  fetchMore,
}: ItemDetailsProps) {
  const router = useRouter();
  const client = useApolloClient();
  const [comment, setComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [findNotification] = useLazyQuery<
    FindNotificationData,
    FindNotificationVars
  >(queries.FIND_NOTIFICATION, {
    fetchPolicy: "no-cache",
    onCompleted({ findNotification }) {
      if (!findNotification) setIsModalOpen(true);
      else router.push(`/notifications/${findNotification.id}`);
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
  });

  const [createThread] = useMutation<CreateThreadData, CreateThreadVars>(
    mutations.CREATE_THREAD,
    {
      update(cache, { data }) {
        setComment("");
        const query =
          type === "post"
            ? queries.GET_POST_DETAILS
            : queries.GET_REQUEST_DETAILS;
        const variables = {
          [`${type}Id`]: item.id,
          communityId: community.id,
          threadsOffset: 0,
          threadsLimit: THREADS_LIMIT,
        };
        const itemDetailsCache: any = cache.readQuery({
          query,
          variables,
        });

        if (itemDetailsCache) {
          cache.writeQuery({
            query,
            variables,
            data: {
              ...itemDetailsCache,
              [type]: {
                ...itemDetailsCache[type],
                paginatedThreads: {
                  ...itemDetailsCache[type].paginatedThreads,
                  threads: [
                    data!.createThread,
                    ...itemDetailsCache[type].paginatedThreads.threads,
                  ],
                },
              },
            },
          });
        }
      },
    }
  );

  return (
    <>
      <div className="item-content">
        <div className="item-info">
          <div
            className="item-img"
            style={{
              backgroundImage: `url(${transformImgUrl(item.imageUrl, 700)})`,
            }}
          ></div>
          {children}
        </div>
        <div className="item-creator">
          <div className="creator-img">
            <Image
              alt="profile pic"
              src={
                item.creator.imageUrl
                  ? transformImgUrl(item.creator.imageUrl, 500)
                  : "/profile-img.png"
              }
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="creator-info">
            <p className="main-p name">{item.creator.name}</p>
            <h6>Find me: {item.creator.apartment}</h6>
            <p>
              Member since{" "}
              <span className="join-date">
                {moment(+item.creator.createdAt).format("MMM DD")}
              </span>
            </p>
            {item.creator.id !== userId && (
              <button
                className="msg-btn"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  findNotification({
                    variables: {
                      recipientId: item.creator.id,
                      communityId: community.id,
                    },
                  });
                }}
                onMouseOver={() => {
                  client.query({
                    query: queries.FIND_NOTIFICATION,
                    variables: {
                      recipientId: item.creator.id,
                      communityId: community.id,
                    },
                  });
                }}
              >
                Send Message
              </button>
            )}
          </div>
        </div>
      </div>
      {item.paginatedThreads.hasMore && (
        <div className="load-more">
          <button
            onClick={() => {
              fetchMore({
                variables: {
                  threadsOffset: item.paginatedThreads.threads.length,
                  threadsLimit: 5,
                },
                updateQuery(prev: any, { fetchMoreResult }: any) {
                  if (!fetchMoreResult) return prev;
                  return {
                    ...prev,
                    [type]: {
                      ...prev[type],
                      paginatedThreads: {
                        ...prev[type].paginatedThreads,
                        threads: [
                          ...prev[type].paginatedThreads.threads,
                          ...fetchMoreResult[type].paginatedThreads.threads,
                        ],
                        hasMore: fetchMoreResult[type].paginatedThreads.hasMore,
                      },
                    },
                  };
                },
              });
            }}
          >
            Load older threads
          </button>
        </div>
      )}
      <div className="item-separator" />
      <div className="threads-container">
        {item.paginatedThreads.threads
          .slice()
          .reverse()
          .map((thread) => (
            <Fragment key={thread.id}>
              <div className="thread-control">
                {community.members
                  .filter((member) => member.id === thread.creator.id)
                  .map((creator) => (
                    <Fragment key={creator.id}>
                      <div className="member-img">
                        <Image
                          alt="profile pic"
                          src={
                            creator.imageUrl
                              ? transformImgUrl(creator.imageUrl, 200)
                              : "/profile-img.png"
                          }
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <div className="thread-content">
                        <span>{creator.name}</span>
                        <p>{thread.content}</p>
                      </div>
                    </Fragment>
                  ))}
              </div>
              <div className="item-separator" />
            </Fragment>
          ))}
        {community?.members
          .filter((member) => member.id === userId)
          .map((member) => (
            <div className="thread-control" key={member.id}>
              <div className="member-img">
                <Image
                  alt="profile pic"
                  src={
                    member.imageUrl
                      ? transformImgUrl(member.imageUrl, 200)
                      : "/profile-img.png"
                  }
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="new-thread-content">
                <span>{member.name}</span>
                <input
                  type="text"
                  className="main-input"
                  placeholder="Comment something..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyUp={(e) => {
                    const keyCode = e.keyCode || e.which;
                    if (keyCode === 13 && comment !== "") {
                      createThread({
                        variables: {
                          threadInput: {
                            content: comment,
                            isPost: type === "post",
                            parentId: item.id,
                            communityId: community.id,
                            recipientId: item.creator.id,
                          },
                        },
                      });
                    }
                  }}
                />
              </div>
            </div>
          ))}
      </div>
      <Modal
        className="react-modal"
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <p className="main-p">
          Would you like to sent a message to {item.creator.name} ?
        </p>
        <button
          className="main-btn modal"
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            createNotification({
              variables: {
                notificationInput: {
                  type: NotificationType.CHAT,
                  recipientId: item.creator.id,
                  communityId: community.id,
                },
              },
            });
          }}
        >
          {mutationLoading ? <Loader /> : "Yes"}
        </button>
        <button
          className="main-btn modal grey"
          type="button"
          onClick={() => setIsModalOpen(false)}
        >
          Close
        </button>
      </Modal>
      <style jsx>
        {`
          @import "../pages/index.scss";

          .load-more {
            display: flex;

            button {
              margin: 10px auto;
              border: none;
              color: $orange;
              text-align: center;
              background: $background;
              font-size: 17px;
              text-decoration: underline;
              font-weight: bold;

              &:hover {
                cursor: pointer;
              }
            }
          }

          .item-content {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;

            .msg-btn {
              color: $background;
              background: $beige;
              padding: 5px 12px;
              border: none;
              border-radius: 15px;
              font-size: 15px;
            }

            @include lg {
              flex-direction: column;
            }

            .item-info {
              display: flex;
              justify-content: flex-start;
              align-items: center;

              @include lg {
                justify-content: space-between;
              }

              @include sm {
                flex-direction: column;
              }

              .item-img {
                height: 290px;
                width: 320px;
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;

                @include md {
                  max-height: 227px;
                  max-width: 250px;
                }

                @include sm {
                  max-width: 80vw;
                }
              }
            }

            .item-creator {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              box-shadow: 0px 0px 6px $white;

              @include lg {
                margin-top: 20px;
                flex-direction: row;
                justify-content: start;
              }

              .creator-img {
                margin: 10px;
                width: 140px;
                height: 140px;
                position: relative;
                overflow: hidden;
                border-radius: 50%;

                @include lg {
                  width: 110px;
                  height: 110px;
                }

                @include sm {
                  width: 90px;
                  height: 90px;
                  padding-right: 0;
                  margin: 10px 0px 10px 10px;
                }
              }

              .creator-info {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                overflow-wrap: break-word;
                text-align: center;

                @include lg {
                  width: 70%;
                }

                @include sm {
                  padding: 10px 10px 10px 0px;
                }

                p {
                  color: $grey-300;
                  margin: 7px 0;
                  max-width: 150px;

                  @include lg {
                    max-width: initial;
                  }

                  &.name {
                    color: $black;
                    font-weight: bold;
                  }
                }

                h6 {
                  font-size: 16px;
                  color: $grey-300;
                  max-width: 150px;
                }
              }
            }
          }

          .thread-control {
            width: 100%;
            display: flex;
            align-items: center;

            .member-img {
              margin: 15px 15px 15px 0;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              position: relative;
              overflow: hidden;
            }

            .thread-content {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              max-width: 88%;
              padding: 15px 0;

              @include sm {
                max-width: 68%;
              }

              @include sm {
                max-width: 77%;
              }

              span {
                font-size: 20px;
                margin-bottom: 10px;
              }

              p {
                color: $black;
                font-size: 16px;
                word-wrap: break-word;
              }
            }

            .new-thread-content {
              width: 100%;
              display: flex;
              flex-direction: column;
              margin-bottom: 20px;

              .main-p {
                margin: initial;
                margin-top: 16px;
                color: $black;
              }

              span {
                margin-top: 15px;
                font-size: 20px;
              }

              .main-input {
                height: initial;
                width: initial;
                max-width: initial;
                margin: 10px 0;
                font-size: 16px;
                height: 10px;
                flex: 2;
              }
            }
          }

          .item-separator {
            width: 100%;
            height: 2px;
            background: #f2f2f2bb;
          }
        `}
      </style>
      <style jsx global>
        {`
          @import "../pages/index.scss";

          .item-icon {
            color: $grey-300;
            font-size: 18px;
          }
        `}
      </style>
    </>
  );
}

Modal.setAppElement("#__next");
