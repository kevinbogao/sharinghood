import { useState } from "react";
import Image from "next/image";
import Modal from "react-modal";
import { useRouter } from "next/router";
import {
  useQuery,
  useMutation,
  useReactiveVar,
  useApolloClient,
} from "@apollo/client";
import { queries, mutations } from "../../../lib/gql";
import { Container, Loader } from "../../../components/Container";
import {
  communityIdVar,
  tokenPayloadVar,
  createCommunityDataVar,
} from "../../_app";
import type {
  Community,
  FindCommunityData,
  FindCommunityVars,
  JoinCommunityData,
  JoinCommunityVars,
  UserCommunitiesData,
} from "../../../lib/types";

export default function CommunityInvite() {
  const router = useRouter();
  const client = useApolloClient();
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const [errMsg, setErrMsg] = useState("");
  const [isErrOpen, setIsErrOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const { data, loading } = useQuery<FindCommunityData, FindCommunityVars>(
    queries.FIND_COMMUNITY,
    {
      skip: !router.query.code,
      variables: { communityCode: router.query.code?.toString()! },
      onCompleted({ findCommunity }) {
        const isMember = findCommunity.members.some(
          (member) => member.id === tokenPayload?.userId
        );
        if (isMember) {
          communityIdVar(findCommunity.id);
          localStorage.setItem("@sharinghood:communityId", findCommunity.id);
          router.push("/posts");
        }
      },
    }
  );

  const [joinCommunity, { loading: mutationLoading }] = useMutation<
    JoinCommunityData,
    JoinCommunityVars
  >(mutations.JOIN_COMMUNITY, {
    update(cache, { data }) {
      if (!data) return;
      const userCommunitiesCache = cache.readQuery<UserCommunitiesData, void>({
        query: queries.GET_USER_COMMUNITIES,
      });

      if (userCommunitiesCache) {
        cache.writeQuery<UserCommunitiesData, void>({
          query: queries.GET_USER_COMMUNITIES,
          data: {
            communities: [
              ...userCommunitiesCache.communities,
              { ...data.joinCommunity, notificationCount: 0 },
            ],
          },
        });
      }

      localStorage.setItem("@sharinghood:communityId", data.joinCommunity.id);
      communityIdVar(data.joinCommunity.id);
      router.push("/posts");
    },
  });

  function handleJoinCommunity(community: Community): void {
    if (tokenPayload) {
      const isMember = community.members.some(
        (member) => member.id === tokenPayload.userId
      );
      const userCommunities = client.readQuery<UserCommunitiesData, void>({
        query: queries.GET_USER_COMMUNITIES,
      });
      if (isMember) {
        setErrMsg(`You are already a member of ${community.name}`);
        setIsErrOpen(true);
      } else if (
        userCommunities?.communities &&
        userCommunities.communities.length >= 5
      ) {
        setErrMsg("You have reached the maximum number of communities");
        setIsErrOpen(true);
      } else {
        setIsJoinOpen(true);
      }
    } else {
      createCommunityDataVar({
        isCreator: false,
        communityId: community.id,
        communityName: community.name,
        communityCode: community.code,
        communityZipCode: community.zipCode,
      });
      router.push("/register");
    }
  }

  return (
    <Container auth={false} loading={loading}>
      <div className="community-invite-control">
        {!data?.findCommunity ? (
          <div className="invalid-link">
            <h3>The invite link you have entered is invalid.</h3>
          </div>
        ) : (
          <>
            <div className="invite-text">
              <h3>Amazing to see you here!</h3>
              <p>You have been invited to {data.findCommunity.name}</p>
              <p>
                Sharinghood is a platform which enables you to share items with
                your community.
              </p>
              <p>You are only one registration away from an easier life.</p>
              <button
                className="main-btn new"
                onClick={() => handleJoinCommunity(data.findCommunity)}
                type="submit"
              >
                Join {data.findCommunity.name} now
              </button>
            </div>
            <div className="invite-img">
              <div className="img-text">
                <h3>How does it work?</h3>
                <p>
                  Browse through the items which your community members are
                  willing to share.. If you don’t find what you need, simply
                  request it.
                </p>
                <div className="img-image">
                  <Image
                    alt="profile pic"
                    src="/product-screenshot.png"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
              <button
                className="main-btn new"
                onClick={() => handleJoinCommunity(data.findCommunity)}
                type="submit"
              >
                Join {data.findCommunity.name} now
              </button>
            </div>
            <Modal
              className="react-modal"
              isOpen={isJoinOpen}
              onRequestClose={() => setIsJoinOpen(false)}
            >
              <p className="main-p">Join {data.findCommunity.name}?</p>
              <button
                className="main-btn modal"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  joinCommunity({
                    variables: { communityId: data.findCommunity.id },
                  });
                }}
              >
                {mutationLoading ? <Loader /> : "Yes"}
              </button>
              <button
                type="button"
                className="main-btn modal grey"
                onClick={() => setIsJoinOpen(false)}
              >
                Close
              </button>
            </Modal>
            <Modal
              className="react-modal"
              isOpen={isErrOpen}
              onRequestClose={() => setIsErrOpen(false)}
            >
              <p className="main-p">{errMsg}</p>
              <button
                type="button"
                className="main-btn modal grey"
                onClick={() => setIsErrOpen(false)}
              >
                Close
              </button>
            </Modal>
          </>
        )}
        <style jsx>
          {`
            @import "../../index.scss";

            .community-invite-control {
              margin: auto;
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: $xl-max-width;
              text-align: center;

              @include lg {
                flex-direction: column;
                justify-content: center;
              }

              @include sm {
                margin-top: 0;
                justify-content: flex-start;
                align-items: stretch;
              }

              h3 {
                margin: 0 auto auto auto;
                font-size: 20px;
              }

              p {
                font-size: 14px;
                margin: 14px auto;
              }

              .invite-text {
                padding: 50px;
                background: $grey-200;

                @include sm {
                  padding: 40px;
                }

                p {
                  max-width: 300px;

                  @include lg {
                    max-width: 400px;
                  }
                }
              }

              .invite-img {
                @include lg {
                  margin: 50px auto;
                }

                p {
                  max-width: 500px;
                  margin: 14px auto 20px auto;
                }

                .img-image {
                  margin: auto;
                  width: 500px;
                  height: 300px;
                  position: relative;

                  @include sm {
                    width: 80vw;
                  }
                }
              }
            }

            .invalid-link {
              position: absolute;
              top: 50%;
              left: 50%;
              -ms-transform: translate(-50%, -50%);
              transform: translate(-50%, -50%);
            }
          `}
        </style>
      </div>
    </Container>
  );
}

Modal.setAppElement("#__next");
