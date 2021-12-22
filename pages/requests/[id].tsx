import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import moment from "moment";
import Modal from "react-modal";
import { types } from "../../lib/types";
import { queries, mutations } from "../../lib/gql";
import { communityIdVar, tokenPayloadVar } from "../_app";
import { Container, SVG, Loader } from "../../components/Container";
import ItemDetails from "../../components/ItemDetails";
import { TimeFrame } from "../../lib/types";

export default function RequestDetails() {
  const router = useRouter();
  const communityId = useReactiveVar(communityIdVar);
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { loading, error, data } = useQuery<
    types.RequestDetailsData,
    types.RequestDetailsVars
  >(queries.GET_REQUEST_DETAILS, {
    skip: !router.query.id,
    variables: {
      requestId: router.query.id?.toString()!,
      communityId: communityId!,
    },
  });

  const [deleteRequest, { loading: mutationLoading }] = useMutation<
    types.DeleteRequestData,
    types.DeleteRequestVars
  >(mutations.DELETE_REQUEST, {
    update(cache) {
      const requestsCache = cache.readQuery<
        types.RequestsData,
        types.RequestsVars
      >({
        query: queries.GET_REQUESTS,
        variables: { communityId: communityId! },
      });

      if (!requestsCache) return;
      cache.writeQuery<types.RequestsData, types.RequestsVars>({
        query: queries.GET_REQUESTS,
        variables: { communityId: communityId! },
        data: {
          requests: requestsCache.requests.filter(
            (request) => request.id !== data?.request.id
          ),
        },
      });
      router.push("/requests");
    },
  });

  return (
    <Container loading={loading} error={error}>
      {data?.request && tokenPayload && (
        <div className="item-control">
          <ItemDetails
            type="request"
            item={data.request}
            userId={tokenPayload.userId}
            community={data.community!}
          >
            <div className="item-desc">
              <h3>{data.request.title}</h3>
              <p className="main-p">{data.request.desc}</p>
              {data.request.timeFrame === TimeFrame.ASAP ? (
                <div className="item-misc">
                  <SVG className="condition-icon" icon="clock" />
                  <span>As soon as possible</span>
                </div>
              ) : data.request.timeFrame === TimeFrame.RANDOM ? (
                <div className="item-misc">
                  <SVG className="condition-icon" icon="clock" />
                  <span>No time frame</span>
                </div>
              ) : (
                <>
                  <div className="item-misc">
                    <SVG className="condition-icon" icon="clock" />
                    <span>
                      Date Needed:{" "}
                      {moment(+data.request.dateNeed).format("MMM DD")}
                    </span>
                  </div>
                  <div className="item-misc">
                    <SVG className="condition-icon" icon="userClock" />
                    <span>
                      Needed until:{" "}
                      {moment(+data.request.dateReturn).format("MMM DD")}
                    </span>
                  </div>
                </>
              )}
              {data.request.creator.id === tokenPayload.userId ? (
                <button
                  type="button"
                  className="main-btn item"
                  onClick={() => setIsModalOpen(true)}
                >
                  Delete
                </button>
              ) : (
                <button
                  type="button"
                  className="main-btn item"
                  onClick={() =>
                    router.push({
                      pathname: "/posts/create",
                      query: {
                        requesterId: data.request.creator.id,
                        requesterName: data.request.creator.name,
                      },
                    })
                  }
                >
                  Help {data.request.creator.name}
                </button>
              )}
            </div>
          </ItemDetails>
          <Modal
            className="react-modal"
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
          >
            <p className="main-p">
              Are you sure you want to delete this request?
            </p>
            <button
              type="submit"
              className="main-btn modal"
              onClick={(e) => {
                e.preventDefault();
                deleteRequest({
                  variables: {
                    requestId: data.request.id,
                  },
                });
              }}
            >
              {mutationLoading ? <Loader /> : "Yes"}
            </button>
            <button
              type="button"
              className="main-btn modal grey"
              onClick={() => setIsModalOpen(false)}
            >
              No
            </button>
          </Modal>
          <style jsx>
            {`
              @import "../index.scss";

              .item-control {
                margin: 30px auto;
                width: 80vw;
                max-width: $xl-max-width;

                .main-p {
                  margin-left: 0;
                }

                .main-btn {
                  &.item {
                    margin: 20px 0;
                  }
                }

                .item-desc {
                  margin: 0 20px 0 40px;

                  h3 {
                    font-size: 26px;
                    color: $black;
                    margin: 0 0 20px 0;
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
              @import "../index.scss";

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
