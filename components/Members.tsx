import { useState, useEffect, useRef, RefObject } from "react";
import Image from "next/image";
import { useQuery, useReactiveVar } from "@apollo/client";
import { types } from "../lib/types";
import { queries } from "../lib/gql";
import { transformImgUrl } from "../lib";
import { tokenPayloadVar, communityIdVar } from "../pages/_app";
import { SVG } from "./Container";

export default function Members() {
  const node: RefObject<HTMLDivElement> | undefined = useRef(null);
  const communityId = useReactiveVar(communityIdVar);
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data } = useQuery<types.CommunityData, types.CommunityVars>(
    queries.GET_COMMUNITY_AND_MEMBERS,
    {
      skip: !communityId,
      variables: { communityId: communityId! },
    }
  );

  function handleClickOutside(e: Event) {
    if (e.target instanceof Node && node?.current?.contains(e.target)) return;
    setIsExpanded(false);
  }

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div ref={node} className={`members-control ${isExpanded && "expanded"}`}>
      <div>
        <SVG
          className={`expand-icon ${isExpanded && "expanded"}`}
          icon="angleDoubleLeft"
          onClick={() => setIsExpanded(!isExpanded)}
        />
      </div>
      <div className="members-content">
        {data?.community && data.community.members?.length < 2 ? (
          <p>You are the only member in your community.</p>
        ) : (
          <p>
            {data?.community && data.community.members?.length - 1} members in
            your community
          </p>
        )}
        <div className="members-icon">
          {data?.community?.members
            .filter((member) => member.id !== tokenPayload?.userId)
            .map((member) => (
              <div key={member.id} className="member-icon">
                {isExpanded && (
                  <span className="icon-tooltip">{member.name}</span>
                )}
                <div className="member-img">
                  <Image
                    alt="Profile picture"
                    src={
                      member.imageUrl
                        ? transformImgUrl(member.imageUrl, 200)
                        : "/profile-img.png"
                    }
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
      <style jsx global>
        {`
          @import "../pages/index.scss";

          .members-control {
            position: fixed;
            right: 0%;
            bottom: 7%;
            display: flex;
            align-items: center;
            box-shadow: 0px 0px 8px $grey-300;
            color: $black;
            background: $grey-100;
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
            transition: all 200ms ease-in-out;
            max-width: 140px;

            @include lg {
              max-width: 120px;
            }

            @include md {
              max-width: 100px;
            }

            @include sm {
              max-width: 75px;
              bottom: 10%;
            }

            &.expanded {
              max-width: 88%;
              overflow-x: scroll;

              @include md {
                max-width: 85%;
              }

              @include sm {
                max-width: 80%;
              }
            }

            p {
              margin: 5px 0;
            }

            .expand-icon {
              color: #000;
              width: 17px;
              right: 0px;
              margin: auto 5px auto 7px;
              cursor: pointer;

              &.expanded {
                -webkit-transform: rotate(180deg);
                -moz-transform: rotate(180deg);
                -o-transform: rotate(180deg);
                -ms-transform: rotate(180deg);
                transform: rotate(180deg);
              }
            }

            .members-content {
              display: flex;
              flex-direction: column;

              .members-icon {
                display: flex;

                .member-icon {
                  .member-img {
                    margin: 5px 5px 7px 0;
                    height: 45px;
                    width: 45px;
                    border-radius: 50%;
                    position: relative;
                    overflow: hidden;
                  }

                  .icon-tooltip {
                    visibility: hidden;
                    width: 120px;
                    background-color: $grey-300;
                    color: white;
                    text-align: center;
                    border-radius: 6px;
                    padding: 5px 0;
                    position: absolute;
                    z-index: 9000 !important;
                    margin-top: -28px;
                    margin-left: -38px;
                  }

                  &:hover {
                    .icon-tooltip {
                      visibility: visible;
                    }
                  }
                }
              }
            }
          }
        `}
      </style>
    </div>
  );
}
