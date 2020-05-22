import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

function Threads({ threads, members }) {
  return (
    <div className="threads-container">
      {threads.map((thread) => (
        <Fragment key={thread._id}>
          <div className="thread-control">
            {members
              .filter((member) => member._id === thread.poster._id)
              .map((member) => (
                <Fragment key={member._id}>
                  <img src={member.picture} alt="Member" />
                  <div className="thread-content">
                    <span className="prev-p">{member.name}</span>
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
          @import './src/assets/scss/index.scss';

          .thread-control {
            width: 100%;
            display: flex;

            img {
              margin: 20px 20px 20px 0;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              object-fit: fill;
            }

            .thread-content {
              display: flex;
              flex-direction: column;
              justify-content: space-evenly;

              span {
                color: $bronze-200;
              }

              p {
                color: $brown;
                font-size: 16px;
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

Threads.propTypes = {
  threads: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      poster: PropTypes.shape({
        _id: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ).isRequired,
  members: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      picture: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default Threads;
