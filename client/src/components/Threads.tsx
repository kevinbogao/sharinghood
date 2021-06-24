import { Fragment } from "react";
import { transformImgUrl } from "../utils/helpers";
import { typeDefs } from "../utils/typeDefs";

interface ThreadsProps {
  threads: Array<typeDefs.Thread>;
  members: Array<typeDefs.User>;
  communityId: string;
}

export default function Threads({
  threads,
  members,
  communityId,
}: ThreadsProps) {
  return (
    <div className="threads-container">
      {threads
        .filter((thread) => thread.community._id === communityId)
        .map((thread) => (
          <Fragment key={thread._id}>
            <div className="thread-control">
              {members
                .filter((member) => member._id === thread.poster._id)
                .map((member) => (
                  <Fragment key={member._id}>
                    <div
                      className="member-img"
                      style={{
                        backgroundImage: `url(${transformImgUrl(
                          JSON.parse(member.image).secure_url,
                          200
                        )})`,
                      }}
                    />
                    <div className="thread-content">
                      <span className="">{member.name}</span>
                      <p>{thread.content}</p>
                    </div>
                  </Fragment>
                ))}
            </div>
            <div className="item-separator" />
          </Fragment>
        ))}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .thread-control {
            width: 100%;
            display: flex;

            .member-img {
              margin: 20px 20px 20px 0;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              background-size: cover;
              background-position: center;
            }

            .thread-content {
              display: flex;
              flex-direction: column;
              justify-content: space-evenly;
              max-width: 88%;

              @include sm {
                max-width: 68%;
              }

              @include sm {
                max-width: 77%;
              }

              span {
                font-size: 20px;
              }

              p {
                color: $black;
                font-size: 16px;
                word-wrap: break-word;
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
    </div>
  );
}