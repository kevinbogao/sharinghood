import { useState, useEffect, useRef } from "react";
import { useQuery, useReactiveVar } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleLeft } from "@fortawesome/free-solid-svg-icons";
import { queries } from "../utils/gql";
import { transformImgUrl } from "../utils/helpers";
import { tokenPayloadVar, selCommunityIdVar } from "../utils/cache";

export default function Members() {
  const node = useRef();
  const [isExpanded, setIsExpanded] = useState(false);
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const selCommunityId = useReactiveVar(selCommunityIdVar);
  const { data } = useQuery(queries.LOCAL_COMMUNITY, {
    skip: !selCommunityId,
    variables: { communityId: selCommunityId },
  });

  function handleClickOutside(e) {
    if (node.current.contains(e.target)) return;
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
      <FontAwesomeIcon
        className={`expand-icon ${isExpanded && "expanded"}`}
        icon={faAngleDoubleLeft}
        onClick={() => setIsExpanded(!isExpanded)}
      />
      <div className="members-content">
        {data?.community?.members?.length < 2 ? (
          <p>You are the only member in your community.</p>
        ) : (
          <p>
            {data?.community?.members?.length - 1} members in your community
          </p>
        )}
        <div className="members-icon">
          {data?.community?.members
            .filter((member) => member._id !== tokenPayload.userId)
            .map((member) => (
              <div key={member._id} className="member-icon">
                {isExpanded && (
                  <span className="icon-tooltip">{member.name}</span>
                )}
                <div
                  className="member-img"
                  style={{
                    backgroundImage: `url(${transformImgUrl(
                      JSON.parse(member.image).secure_url,
                      200
                    )})`,
                  }}
                />
              </div>
            ))}
        </div>
      </div>
      <style jsx global>
        {`
          @import "./src/assets/scss/index.scss";

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
              font-size: 20px;
              margin: 0 8px;

              &:hover {
                cursor: pointer;
              }

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
                    background-size: cover;
                    background-position: center;
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
