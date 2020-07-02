import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import moment from 'moment';
import Loading from './Loading';

const MODAL_STYLE = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    borderWidth: 0,
    boxShadow: '0px 0px 6px #f2f2f2',
    padding: '30px',
  },
};

const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($notificationInput: NotificationInput) {
    createNotification(notificationInput: $notificationInput)
  }
`;

function ItemDetails({ item, userId, children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createNotification, { loading: mutationLoading }] = useMutation(
    CREATE_NOTIFICATION,
    {
      onCompleted: (data) => {
        console.log(data);
      },
      onError: ({ message }) => {
        console.log(message);
      },
    },
  );

  return (
    <>
      <div className="item-content">
        <div className="item-info">
          <div className="item-img">
            <img src={JSON.parse(item.image).secure_url} alt="" />
          </div>
          {children}
        </div>
        <div className="item-creator">
          <img src={JSON.parse(item.creator.image).secure_url} alt="" />
          <div className="creator-info">
            <p className="prev-p name">{item.creator.name}</p>
            <h6>Find me: {item.creator.apartment}</h6>
            <p>
              Member since{' '}
              <span className="join-date">
                {moment(+item.creator.createdAt).format('MMM DD')}
              </span>
            </p>
            {item.creator._id !== userId && (
              <button
                className=""
                type="button"
                onClick={() => setIsModalOpen(true)}
              >
                Send Message
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="item-separator" />
      <Modal
        isOpen={isModalOpen}
        style={MODAL_STYLE}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <p className="modal-p">
          Would you like to sent a message to {item.creator.name} ?
        </p>
        <button
          className="modal-btn full"
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            createNotification({
              variables: {
                notificationInput: {
                  onType: 2,
                  recipientId: item.creator._id,
                },
              },
            });
          }}
        >
          Yes
        </button>
        <button
          className="modal-btn full bronze"
          type="button"
          onClick={() => setIsModalOpen(false)}
        >
          Close
        </button>
      </Modal>
      {mutationLoading && <Loading isCover />}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .item-content {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;

            @include lg {
              flex-direction: column;
            }

            .item-info {
              display: flex;
              justify-content: start;
              align-items: center;

              @include lg {
                justify-content: space-between;
              }

              @include sm {
                flex-direction: column;
              }

              .item-img {
                img {
                  max-height: 290px;
                  max-width: 320px;

                  @include md {
                    max-height: 227px;
                    max-width: 250px;
                  }

                  @include sm {
                    max-width: 80vw;
                  }
                }
              }
            }

            .item-creator {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              box-shadow: 0px 0px 6px $white;

              @include lg {
                margin-top: 20px;
                flex-direction: row;
                justify-content: start;
              }

              img {
                padding: 10px;
                width: 140px;
                height: 140px;
                border-radius: 50%;
                object-fit: fill;

                @include lg {
                  width: 110px;
                  height: 110px;
                }

                @include sm {
                  width: 90px;
                  height: 90px;
                  padding-right: 0;
                }
              }

              .creator-info {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                overflow-wrap: break-word;
                text-align: center;

                @include lg {
                  width: 70%;
                }

                p {
                  color: $brown;
                  margin: 7px 0;
                  max-width: 150px;

                  @include lg {
                    max-width: initial;
                  }

                  &.name {
                    color: $bronze-100;
                    font-weight: bold;
                  }

                  span {
                    color: $bronze-100;
                  }
                }

                h6 {
                  font-size: 16px;
                  color: $brown;
                  max-width: 150px;
                }
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
      <style jsx global>
        {`
          @import './src/assets/scss/index.scss';

          .item-icon {
            color: $bronze-200;
            font-size: 18px;
          }
        `}
      </style>
    </>
  );
}

Modal.setAppElement('#root');

ItemDetails.propTypes = {
  item: PropTypes.shape({
    image: PropTypes.string.isRequired,
    creator: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      apartment: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  userId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default ItemDetails;
