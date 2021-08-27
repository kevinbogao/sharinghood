import { useState } from "react";
import { Location, History } from "history";
import {
  useQuery,
  useLazyQuery,
  useMutation,
  useReactiveVar,
} from "@apollo/client";
import Spinner from "../../components/Spinner";
import InlineError from "../../components/InlineError";
import ServerError from "../../components/ServerError";
import { queries, mutations } from "../../utils/gql";
import { typeDefs } from "../../utils/typeDefs";
import { validateForm, FormError } from "../../utils/helpers";
import { tokenPayloadVar, selCommunityIdVar } from "../../utils/cache";

type State = { fromLogin?: boolean; communityCode?: string };

interface SelectCommunityProps {
  history: History;
  location: Location<State>;
}

export default function SelectCommunity({
  history,
  location,
}: SelectCommunityProps) {
  let code: HTMLInputElement | null;
  const { fromLogin } = location.state || { fromLogin: false };
  const { communityCode } = location.state || { communityCode: null };
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const selCommunityId = useReactiveVar(selCommunityIdVar);
  const [pageError, setPageError] = useState<FormError>({});
  const [isNewCommunity, setIsNewCommunity] = useState(false);
  const [foundCommunity, setFoundCommunity] =
    useState<typeDefs.Community | null>(null);

  function selectCommunity(communityId: string) {
    // Store communityId in localStorage
    localStorage.setItem("@sharinghood:selCommunityId", communityId);

    // Update selCommunityId cache
    selCommunityIdVar(communityId);

    // Redirect user to CommunityInvite page if user is redirected from
    // Login page and has a communityCode; else redirect user to posts page
    if (communityCode) history.push(`/community/${communityCode}`);
    else history.push("/find");
  }

  // Redirect user to posts page if selCommunityId exists (communityId)
  // in localStorage or user is only in one community.
  const { loading, error, data } = useQuery<typeDefs.UserCommunitiesData, void>(
    queries.GET_USER_COMMUNITIES,
    {
      onCompleted: ({ communities }) => {
        // Check if selectedCommunityId exists in communities array
        const isIdInArray = communities.some(
          (community) => community._id === selCommunityId
        );

        // If selected community id exists in localStorage & it the user is a
        // member of that community
        if (selCommunityId && isIdInArray) {
          selectCommunity(selCommunityId);

          // Redirect to posts page
          history.push("/find");

          // If user is redirect from login and only has one community
        } else if (communities.length === 1 && fromLogin) {
          selectCommunity(communities[0]._id);

          // Redirect to posts page
          history.push("/find");

          // If user is redirect from login and communityCode is given
        } else if (fromLogin && communityCode) {
          selectCommunity(communities[0]._id);
        }
        // eslint-disable-next-line
      },
      onError: ({ message }) => {
        console.warn(message);
      },
    }
  );

  // Find community, limit user communities to 5
  const [community] = useLazyQuery<
    typeDefs.FindCommunityAndMembersData,
    typeDefs.FindCommunityAndMembersVars
  >(queries.FIND_COMMUNITY_AND_MEMBERS, {
    onCompleted: ({ community }) => {
      if (community && tokenPayload) {
        // True if user is inside of community members array
        const userIsMember = community.members.some(
          (member) => member._id === tokenPayload.userId
        );

        // Throw error if user is in 5 communities already
        if (data?.communities && data.communities.length >= 5)
          setPageError({
            code: "You have reached the maximum number of communities",
          });
        // Check if user is part of the community
        else if (userIsMember)
          setPageError({
            code: `You are already a member of ${community.name}`,
          });
        else setFoundCommunity(community);
      } else {
        // Set community error if community is not found
        setPageError({ code: "Community not found" });
      }
    },
    onError: ({ message }) => {
      const errMsgArr = message.split(": ");
      const errMsgArrLen = errMsgArr.length;
      setPageError({
        [errMsgArr[errMsgArrLen - 2]]: errMsgArr[errMsgArrLen - 1],
      });
    },
  });

  // Add user to community
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

        // Set community id
        selectCommunity(data.joinCommunity._id);
      }

      // Redirect to posts page
      history.push("/find");
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  return loading ? (
    <Spinner />
  ) : error ? (
    <ServerError />
  ) : (
    <div className="communities-control">
      {isNewCommunity ? (
        <>
          {foundCommunity ? (
            <div>
              <p className="main-p">Join {foundCommunity.name}</p>
              <button
                className="main-btn block"
                type="button"
                onClick={() => {
                  joinCommunity({
                    variables: {
                      communityId: foundCommunity._id,
                    },
                  });
                }}
              >
                Yes
              </button>
              <button
                className="main-btn block grey"
                type="button"
                onClick={() => {
                  setFoundCommunity(null);
                  setIsNewCommunity(false);
                }}
              >
                No
              </button>
            </div>
          ) : (
            <>
              <p className="main-p">Join an existing community</p>
              <input
                className="main-input"
                placeholder="Community Code"
                ref={(node) => (code = node)}
              />
              {pageError.code && <InlineError text={pageError.code} />}
              <button
                className="main-btn block"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const errors = validateForm({ code });
                  setPageError(errors);
                  if (Object.keys(errors).length === 0 && code) {
                    community({
                      variables: {
                        communityCode: code.value,
                      },
                    });
                  }
                }}
              >
                Find community
              </button>
              <p className="main-p">Or create your own community</p>
              <button
                className="main-btn block"
                type="button"
                onClick={() => {
                  if (data?.communities && data.communities.length >= 5) {
                    setPageError({
                      code: "You have reached the maximum number of communities",
                    });
                  } else {
                    history.push({
                      pathname: "/create-community",
                      state: { isLoggedIn: true },
                    });
                  }
                }}
              >
                Create Community
              </button>
              <button
                className="main-btn block grey"
                type="button"
                onClick={() => {
                  setIsNewCommunity(false);
                  setPageError({});
                }}
              >
                Return
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <p className="main-p">Select a community</p>
          {data &&
            data.communities.map((community) => (
              <button
                key={community._id}
                className="main-btn block beige"
                type="submit"
                onClick={() => selectCommunity(community._id)}
              >
                {community.name}
                {community.hasNotifications && (
                  <span className="community-unread" />
                )}
              </button>
            ))}
          <p className="main-p">Join an other community</p>
          <button
            className="main-btn block"
            type="button"
            onClick={() => {
              if (data?.communities && data.communities.length >= 5) {
                setPageError({
                  code: "You have reached the maximum number of communities",
                });
              } else {
                setIsNewCommunity(true);
              }
            }}
          >
            New Community
          </button>
          {pageError.code && <InlineError text={pageError.code} />}
        </>
      )}
      {mutationLoading && <Spinner isCover />}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .communities-control {
            margin: auto;

            @include sm {
              max-width: 300px;
              width: 80vw;
            }

            .main-btn {
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .community-unread {
              margin-left: 15px;
              width: 10px;
              height: 10px;
              background: $blue;
              border-radius: 50%;
            }
          }
        `}
      </style>
    </div>
  );
}
