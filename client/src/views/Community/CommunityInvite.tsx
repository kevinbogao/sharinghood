import { useState } from "react";
import {
  useQuery,
  useMutation,
  useApolloClient,
  useReactiveVar,
} from "@apollo/client";
import { History } from "history";
import { match } from "react-router-dom";
import Modal from "react-modal";
import Spinner from "../../components/Spinner";
import ProductScreenshot from "../../assets/images/product-screenshot.png";
import { queries, mutations } from "../../utils/gql";
import { typeDefs } from "../../utils/typeDefs";
import { tokenPayloadVar, selCommunityIdVar } from "../../utils/cache";

interface CommunityInviteProps {
  match: match<{ communityCode: string }>;
  history: History;
}

export default function CommunityInvite({
  match,
  history,
}: CommunityInviteProps) {
  const client = useApolloClient();
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const [pageError, setPageError] = useState("");
  const [isErrModalOpen, setIsErrModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Find community by community code from url
  const { loading, data } = useQuery<
    typeDefs.FindCommunityAndMembersData,
    typeDefs.FindCommunityAndMembersVars
  >(queries.FIND_COMMUNITY_AND_MEMBERS, {
    variables: { communityCode: match.params.communityCode },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  // Mutation for user to joinCommunity
  const [joinCommunity, { loading: mutationLoading }] = useMutation<
    typeDefs.JoinCommunityData,
    typeDefs.JoinCommunityVars
  >(mutations.JOIN_COMMUNITY, {
    update(cache, { data }) {
      // Get and update communities cache
      const userCommunitiesCache = cache.readQuery<
        typeDefs.UserCommunitiesData,
        void
      >({
        query: queries.GET_USER_COMMUNITIES,
      });

      if (data) {
        // Update cache if userCommunitiesCache exists
        if (userCommunitiesCache) {
          cache.writeQuery<typeDefs.UserCommunitiesData, void>({
            query: queries.GET_USER_COMMUNITIES,
            data: {
              communities: [
                ...userCommunitiesCache.communities,
                { ...data.joinCommunity, hasNotifications: false },
              ],
            },
          });
        }

        // Set community id to localStorage, change community id cache
        // & redirect to /find
        localStorage.setItem(
          "@sharinghood:selCommunityId",
          data.joinCommunity._id
        );
        selCommunityIdVar(data.joinCommunity._id);
        history.push("/find");
      }
    },
    onError: ({ message }) => {
      setPageError(message);
    },
  });

  // Try to join user to community if user is logged in,
  // else redirect user CommunityExist component
  function handleSubmit(data: typeDefs.FindCommunityAndMembersData): void {
    if (tokenPayload) {
      // Check if user is part of the community
      const userIsMember = data.community.members.some(
        (member) => member._id === tokenPayload.userId
      );

      // Get user communities from cache
      const { communities } = client.readQuery({
        query: queries.GET_USER_COMMUNITIES,
      });

      // Open error modal if user is part of 5 communities already
      if (userIsMember) {
        setPageError(`You are already a member of ${data.community.name}`);
        setIsErrModalOpen(true);
        // Open error modal if user is part of the the community already
      } else if (communities.length >= 5) {
        setPageError("You have reached the maximum number of communities");
        setIsErrModalOpen(true);
      } else {
        setIsJoinModalOpen(true);
      }
    } else {
      history.push({
        pathname: "/find-community",
        state: {
          communityId: data.community._id,
          communityCode: data.community.code,
          communityName: data.community.name,
          members: data.community.members,
          isCreator: false,
        },
      });
    }
  }

  return loading ? (
    <Spinner />
  ) : (
    <div className="community-invite-control">
      {!data?.community ? (
        <div className="invalid-link">
          <h3>The invite link you have entered is invalid.</h3>
        </div>
      ) : (
        <>
          <div className="invite-text">
            <h3>Amazing to see you here!</h3>
            <p>You have been invited to {data.community.name}</p>
            <p>
              Sharinghood is a platform which enables you to share items with
              your community.
            </p>
            <p>You are only one registration away from an easier life.</p>
            <button
              className="main-btn new"
              onClick={() => handleSubmit(data)}
              type="submit"
            >
              Join {data.community.name} now
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
                <img src={ProductScreenshot} alt="Screenshot of our product" />
              </div>
            </div>
            <button
              className="main-btn new"
              onClick={() => handleSubmit(data)}
              type="submit"
            >
              Join {data.community.name} now
            </button>
          </div>
          <Modal
            className="react-modal"
            isOpen={isJoinModalOpen}
            onRequestClose={() => {
              setIsJoinModalOpen(false);
            }}
          >
            <p className="main-p">Join {data.community.name}?</p>
            <button
              className="main-btn modal"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                joinCommunity({
                  variables: {
                    communityId: data.community._id,
                  },
                });
              }}
            >
              Yes
            </button>
            <button
              type="button"
              className="main-btn modal grey"
              onClick={() => {
                setIsJoinModalOpen(false);
              }}
            >
              Close
            </button>
          </Modal>
          <Modal
            className="react-modal"
            isOpen={isErrModalOpen}
            onRequestClose={() => {
              setIsErrModalOpen(false);
            }}
          >
            <p className="main-p">{pageError}</p>
            <button
              type="button"
              className="main-btn modal grey"
              onClick={() => {
                setIsErrModalOpen(false);
              }}
            >
              Close
            </button>
          </Modal>
        </>
      )}
      {mutationLoading && <Spinner isCover />}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

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

              img {
                width: 500px;

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
  );
}
