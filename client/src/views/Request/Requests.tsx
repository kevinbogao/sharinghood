// @ts-nocheck

import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import Spinner from "../../components/Spinner";
import ItemsGrid from "../../components/ItemsGrid";
import ServerError from "../../components/ServerError";
import { queries } from "../../utils/gql";
import { transformImgUrl } from "../../utils/helpers";

export default function Requests({ communityId }) {
  const { loading, error, data, client } = useQuery(queries.GET_REQUESTS, {
    skip: !communityId,
    variables: { communityId },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  return loading ? (
    <Spinner />
  ) : error ? (
    <ServerError />
  ) : (
    <ItemsGrid isPost={false} communityId={communityId}>
      {data?.requests.map((request) => (
        <div key={request._id} className="item-card">
          <Link
            to={{
              pathname: `/requests/${request._id}`,
              state: { image: request.image },
            }}
            onMouseOver={() => {
              client.query({
                query: queries.GET_REQUEST,
                variables: { requestId: request._id },
              });
            }}
          >
            <div
              className="item-img"
              style={{
                backgroundImage: `url(${transformImgUrl(
                  JSON.parse(request.image).secure_url,
                  300
                )})`,
              }}
            />
            <div className="item-info">
              <p className="item-title">{request.title}</p>
              <p>by {request.creator.name}</p>
              <div className="item-needed-on">
                <FontAwesomeIcon className="item-icons" icon={faClock} />
                <span className="item-user">
                  {request.dateType === 0
                    ? "ASAP"
                    : request.dateType === 1
                    ? "Anytime"
                    : moment(+request.dateNeed).format("MMM DD")}
                </span>
              </div>
            </div>
          </Link>
        </div>
      ))}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .item-card {
            background: $grey-100;
            margin: 20px 10px;
            padding: 10px;
            cursor: pointer;

            &:hover {
              background: $grey-200;
            }

            p {
              color: $black;
              font-size: 14px;
              width: 160px;

              &.item-title {
                margin-top: 10px;
                margin-bottom: 5px;
                font-size: 18px;
              }
            }

            .item-img {
              width: 160px;
              height: 136px;
              background-size: cover;
              background-position: center;

              @include md {
                width: 190px;
                height: 160px;
              }

              @include sm {
                width: 250px;
                height: 200px;
              }
            }

            .item-needed-on {
              margin-top: 5px;
              display: flex;
              align-items: center;
              font-size: 15px;
              color: $beige;

              span {
                font-size: 14px;
                margin-left: 6px;
              }
            }
          }
        `}
      </style>
    </ItemsGrid>
  );
}

Requests.propTypes = {
  communityId: PropTypes.string.isRequired,
};
