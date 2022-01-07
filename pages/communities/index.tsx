import { useState } from "react";
import { useRouter } from "next/router";
import {
  useQuery,
  useMutation,
  useLazyQuery,
  useReactiveVar,
} from "@apollo/client";
import { useForm } from "react-hook-form";
import { queries, mutations } from "../../lib/gql";
import { Container, InlineError, Loader } from "../../components/Container";
import { communityIdVar, tokenPayloadVar } from "../../pages/_app";
import type {
  Community,
  FindCommunityData,
  FindCommunityVars,
  JoinCommunityData,
  JoinCommunityVars,
  UserCommunitiesData,
} from "../../lib/types";

interface CommunitiesInput {
  code: string;
}

export default function Communities() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CommunitiesInput>();
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const [isJoinCommunity, setIsJoinCommunity] = useState(false);
  const [communityToJoin, setCommunityToJoin] = useState<Community | null>(
    null
  );

  function selectCommunity(communityId: string): void {
    localStorage.setItem("@sharinghood:communityId", communityId);
    communityIdVar(communityId);
    router.push("/posts");
  }

  const { loading, error, data } = useQuery<UserCommunitiesData, void>(
    queries.GET_USER_COMMUNITIES
  );

  const [community, { loading: findCommunityLoading }] = useLazyQuery<
    FindCommunityData,
    FindCommunityVars
  >(queries.FIND_COMMUNITY, {
    fetchPolicy: "no-cache",
    onCompleted({ findCommunity }) {
      if (findCommunity && tokenPayload) {
        const userIsMember = findCommunity.members.some(
          (member) => member.id === tokenPayload.userId
        );
        if (data?.communities && data.communities.length > 4)
          setError("code", {
            message: "You have reached the maximum number of communities",
          });
        else if (userIsMember)
          setError("code", {
            message: `You are already a member of ${findCommunity.name}`,
          });
        else setCommunityToJoin(findCommunity);
      } else {
        setError("code", { message: "Community not found" });
      }
    },
  });

  const [joinCommunity, { loading: mutationLoading }] = useMutation<
    JoinCommunityData,
    JoinCommunityVars
  >(mutations.JOIN_COMMUNITY, {
    update(cache, { data }) {
      if (!data) return;
      const userCommunitiesCache = cache.readQuery<UserCommunitiesData, void>({
        query: queries.GET_USER_COMMUNITIES,
      });

      if (!userCommunitiesCache) return;
      cache.writeQuery<UserCommunitiesData, void>({
        query: queries.GET_USER_COMMUNITIES,
        data: {
          communities: [
            ...userCommunitiesCache.communities,
            { ...data.joinCommunity, notificationCount: 0 },
          ],
        },
      });

      selectCommunity(data.joinCommunity.id);
    },
  });

  return (
    <Container loading={loading} error={error}>
      <div className="communities-control">
        {isJoinCommunity && communityToJoin ? (
          <>
            <p className="main-p">Join {communityToJoin.name}</p>
            <button
              className="main-btn block"
              type="button"
              onClick={() => {
                joinCommunity({
                  variables: { communityId: communityToJoin.id },
                });
              }}
            >
              {mutationLoading ? <Loader /> : "Yes"}
            </button>
            <button
              className="main-btn block grey"
              type="button"
              onClick={() => {
                setCommunityToJoin(null);
                setIsJoinCommunity(false);
              }}
            >
              No
            </button>
          </>
        ) : isJoinCommunity ? (
          <div className="community-control">
            <p className="main-p">Join an existing community</p>
            <input
              className="main-input"
              placeholder="Community Code"
              {...register("code", {
                required: "Please enter a community code",
                pattern: {
                  value: /^[a-z0-9]+$/i,
                  message: "Please only use standard alphanumerics",
                },
              })}
            />
            {errors.code && <InlineError home text={errors.code.message!} />}
            <button
              className="main-btn block"
              type="button"
              onClick={handleSubmit((form) => {
                if (Object.keys(errors).length === 0)
                  community({ variables: { communityCode: form.code } });
              })}
            >
              {findCommunityLoading ? <Loader /> : "Find community"}
            </button>
            <p className="main-p">Or create your own community</p>
            <button
              className="main-btn block"
              type="button"
              onClick={() => {
                if (data?.communities && data.communities.length > 4)
                  setError("code", {
                    message:
                      "You have reached the maximum number of communities",
                  });
                else router.push("/community/create");
              }}
            >
              Create Community
            </button>
            <button
              className="main-btn block grey"
              type="button"
              onClick={() => {
                setIsJoinCommunity(false);
                clearErrors("code");
              }}
            >
              Return
            </button>
          </div>
        ) : (
          <>
            {data?.communities?.map((community) => (
              <button
                key={community.id}
                className="main-btn block beige"
                type="submit"
                onClick={() => selectCommunity(community.id)}
              >
                {community.name}
                {community.notificationCount > 0 && (
                  <span className="community-unread" />
                )}
              </button>
            ))}
            <p className="main-p">Join an other community</p>
            <button
              className="main-btn block"
              type="button"
              onClick={() => {
                if (data?.communities && data.communities.length > 4)
                  setError("code", {
                    message:
                      "You have reached the maximum number of communities",
                  });
                else setIsJoinCommunity(true);
              }}
            >
              New Community
            </button>
          </>
        )}
        <style jsx>
          {`
            @import "../index.scss";

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
    </Container>
  );
}
