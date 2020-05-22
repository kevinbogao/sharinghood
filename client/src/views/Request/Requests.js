import React from 'react';
import { Link } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import Loading from '../../components/Loading';
import ItemsGrid from '../../components/ItemsGrid';

const GET_REQUESTS = gql`
  query Requests {
    requests {
      _id
      desc
      picture
      dateNeed
      creator {
        _id
        name
      }
    }
  }
`;

function Requests() {
  const { loading, error, data } = useQuery(GET_REQUESTS, {
    onError: ({ message }) => {
      console.log(message);
    },
  });

  return loading ? (
    <Loading />
  ) : error ? (
    `Error! ${error.message}`
  ) : (
    <ItemsGrid isPost={false}>
      {data.requests.map((request) => (
        <div key={request._id} className="item-card">
          <Link
            to={{
              pathname: `/requests/${request._id}`,
              state: { picture: request.picture },
            }}
          >
            <img alt="item" src={request.picture} />
            <div className="item-info">
              <p className="item-title">{request.desc}</p>
              <p>by {request.creator.name}</p>
              <div className="item-needed-on">
                <FontAwesomeIcon className="item-icons" icon={faClock} />
                <span className="item-user">
                  {moment(+request.dateNeed).format('MMM DD')}
                </span>
              </div>
            </div>
          </Link>
        </div>
      ))}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .item-card {
            background: #fafafa;
            margin: 20px 10px;
            padding: 10px;
            cursor: pointer;

            &:hover {
              background: #f4f4f4;
            }

            p {
              color: $brown;
              font-size: 14px;
              width: 160px;

              &.item-title {
                margin-top: 10px;
                margin-bottom: 5px;
                font-size: 18px;
              }
            }

            img {
              width: 160px;
              height: 136px;
              object-fit: cover;

              @include md {
                width: 190px;
                height: 160px;
              }

              @include sm {
                width: 200px;
                height: 170px;
              }
            }

            .item-needed-on {
              margin-top: 5px;
              display: flex;
              align-items: center;
              font-size: 15px;
              color: $bronze-100;

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

export default Requests;
