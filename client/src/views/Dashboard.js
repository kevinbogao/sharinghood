import React, { useState, Fragment } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import Loading from '../components/Loading';

const BOOKING_STATUS = {
  0: 'Pending',
  1: 'Accepted',
  2: 'Amended',
  3: 'Declined',
};

const MODAL_STYLE = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    borderWidth: 0,
    boxShadow: '0px 0px 6px #f2f2f2',
    padding: '20px 50px 230px 50px',
    maxWidth: '320px',
  },
};

const GET_BOOKINGS = gql`
  query GetBookings {
    bookings {
      _id
      post {
        _id
        title
        creator {
          _id
          name
        }
      }
      dateNeed
      dateReturn
      pickupTime
      status
      booker {
        _id
        name
      }
      patcher {
        _id
      }
    }
    userId @client
    userName @client
  }
`;

const UPDATE_BOOKING = gql`
  mutation UpdateBooking($bookingId: ID!, $bookingInput: BookingInput!) {
    updateBooking(bookingId: $bookingId, bookingInput: $bookingInput) {
      _id
      status
      booker {
        _id
      }
      patcher {
        _id
      }
      dateNeed
      dateReturn
      pickupTime
    }
  }
`;

function Dashboard() {
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [pickupDate, setPickupDate] = useState(new Date());
  const { loading, error, data } = useQuery(GET_BOOKINGS, {
    // fetchPolicy: 'network-only',
    onError: ({ message }) => {
      console.log(message);
    },
  });
  const [updateBooking, { loading: mutationLoading }] = useMutation(
    UPDATE_BOOKING,
    {
      onCompleted: () => {
        setIsAcceptOpen(false);
        setIsDeclineOpen(false);
      },
      onError: ({ message }) => {
        console.log(message);
      },
    },
  );

  return loading ? (
    <Loading />
  ) : error ? (
    `Error! ${error.message}`
  ) : (
    <div className="dashboard-control">
      <h1>My Bookings</h1>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Owner</th>
            <th>Requested Date</th>
            <th>Status</th>
            <th>Pick Up Time</th>
          </tr>
        </thead>
        <tbody>
          {data.bookings
            .filter((booking) => booking.booker._id === data.userId)
            .map((booking) => (
              <tr key={booking._id}>
                <td className="title">
                  <Link to={`/shared/${booking.post._id}`}>
                    {booking.post.title}
                  </Link>
                </td>
                <td>{booking.post.creator.name}</td>
                <td>
                  {booking.dateNeed === booking.dateReturn
                    ? moment(+booking.dateNeed).format('MMM DD')
                    : `${moment(+booking.dateNeed).format('MMM DD')} - ${moment(
                        +booking.dateReturn,
                      ).format('MMM DD')}`}
                </td>
                <td className={`status ${BOOKING_STATUS[booking.status]}`}>
                  {BOOKING_STATUS[booking.status]}
                </td>
                <td>
                  {booking.pickupTime
                    ? moment(+booking.pickupTime).format('MMM DD HH:mm')
                    : '-'}
                  {booking.status === 2 && (
                    <>
                      <button
                        type="submit"
                        className="accept"
                        onClick={(e) => {
                          e.preventDefault();
                          updateBooking({
                            variables: {
                              bookingId: booking._id,
                              bookingInput: {
                                status: 1,
                                postId: booking.post._id,
                                notifyContent: `${data.userName} has accepted your suggested pickup time for ${booking.post.title}`,
                                notifyRecipientId: booking.post.creator._id,
                              },
                            },
                          });
                        }}
                      >
                        Accept
                      </button>
                      <button
                        type="submit"
                        className="decline"
                        onClick={(e) => {
                          e.preventDefault();
                          updateBooking({
                            variables: {
                              bookingId: booking._id,
                              bookingInput: {
                                status: 3,
                                postId: booking.post._id,
                                notifyContent: `${data.userName} has decline your suggested pickup time for ${booking.post.title}`,
                                notifyRecipientId: booking.post.creator._id,
                              },
                            },
                          });
                        }}
                      >
                        Decline
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <h1>My Lendings</h1>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Booked by</th>
            <th>Requested Date</th>
            <th>Status</th>
            <th>Pickup Time</th>
          </tr>
        </thead>
        <tbody>
          {data.bookings
            .filter((booking) => booking.booker._id !== data.userId)
            .map((booking) => (
              <tr key={booking._id}>
                <td className="title">
                  <Link to={`/shared/${booking.post._id}`}>
                    {booking.post.title}
                  </Link>
                </td>
                <td>{booking.booker.name}</td>
                <td>
                  {booking.dateNeed === booking.dateReturn
                    ? moment(+booking.dateNeed).format('MMM DD')
                    : `${moment(+booking.dateNeed).format('MMM DD')} - ${moment(
                        +booking.dateReturn,
                      ).format('MMM DD')}`}
                </td>
                {booking.status === 0 ? (
                  <td>
                    <button
                      type="button"
                      className="accept"
                      onClick={() => {
                        setIsAcceptOpen(true);
                        setSelectedBooking(booking._id);
                      }}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="decline"
                      onClick={() => {
                        setIsDeclineOpen(true);
                        setSelectedBooking(booking._id);
                      }}
                    >
                      Decline
                    </button>
                  </td>
                ) : (
                  <td className={`status ${BOOKING_STATUS[booking.status]}`}>
                    {BOOKING_STATUS[booking.status]}
                  </td>
                )}
                <td>
                  {booking.pickupTime
                    ? moment(+booking.pickupTime).format('MMM DD HH:mm')
                    : '-'}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <Modal
        isOpen={isAcceptOpen}
        style={MODAL_STYLE}
        onRequestClose={() => {
          setIsAcceptOpen(false);
          setSelectedBooking(null);
        }}
      >
        {data.bookings
          .filter((booking) => booking._id === selectedBooking)
          .map((booking) => (
            <Fragment key={booking._id}>
              <p className="modal-p">
                Please select a new date for {booking.booker.name} to pickup the
                item.
              </p>
              <DatePicker
                className="prev-input date"
                selected={pickupDate}
                onChange={(date) => setPickupDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="yyyy MM.dd HH:mm"
                minDate={new Date(booking.dateNeed)}
                maxDate={new Date(booking.dateReturn)}
              />
              <button
                type="submit"
                className="modal-btn"
                onClick={() => {
                  updateBooking({
                    variables: {
                      bookingId: selectedBooking,
                      bookingInput: {
                        status: 1,
                        postId: booking.post._id,
                        pickupTime: pickupDate,
                        notifyContent: `${data.userName} has accepted your booking on ${booking.post.title}`,
                        notifyRecipientId: booking.booker._id,
                      },
                    },
                  });
                }}
              >
                Confirm pickup time
              </button>
            </Fragment>
          ))}
      </Modal>
      <Modal
        isOpen={isDeclineOpen}
        style={MODAL_STYLE}
        onRequestClose={() => {
          setIsDeclineOpen(false);
          setSelectedBooking(null);
        }}
      >
        {data.bookings
          .filter((booking) => booking._id === selectedBooking)
          .map((booking) => (
            <Fragment key={booking._id}>
              <p className="modal-p">
                Are you sure that you want to decline this request?
              </p>
              <button
                type="submit"
                className="modal-btn red"
                onClick={() => {
                  updateBooking({
                    variables: {
                      bookingId: selectedBooking,
                      bookingInput: {
                        status: 3,
                        postId: booking.post._id,
                        notifyContent: `${data.userName} has declined your booking on ${booking.post.title}`,
                        notifyRecipientId: booking.booker._id,
                      },
                    },
                  });
                }}
              >
                Confirm decline
              </button>
              <p className="modal-p">
                Or if you are not available for the pickup{' '}
                {booking.dateNeed === booking.dateReturn
                  ? `on ${moment(+booking.dateNeed).format('MMM DD')}`
                  : `from ${moment(+booking.dateNeed).format(
                      'MMM DD',
                    )} to ${moment(+booking.dateReturn).format('MMM DD')}`}{' '}
                you can suggest a different pickup date and time for{' '}
                {booking.booker.name}
              </p>
              <DatePicker
                className="prev-input date"
                selected={pickupDate}
                onChange={(date) => setPickupDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="yyyy MM.dd HH:mm"
              />
              <button
                type="submit"
                className="modal-btn bronze"
                onClick={() => {
                  updateBooking({
                    variables: {
                      bookingId: selectedBooking,
                      bookingInput: {
                        status: 2,
                        postId: booking.post._id,
                        pickupTime: pickupDate,
                        notifyContent: `${data.userName} has suggested a new date for your booking on ${booking.post.title}`,
                        notifyRecipientId: booking.booker._id,
                      },
                    },
                  });
                }}
              >
                Suggest a new date
              </button>
            </Fragment>
          ))}
      </Modal>
      {mutationLoading && <Loading isCover />}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .dashboard-control {
            margin: auto;
            width: $xl-max-width;

            @include xl {
              width: 80vw;
            }

            @include lg {
              width: 85vw;
            }

            @include md {
              width: 90vw;
            }

            @include sm {
              width: 95vw;
              font-size: 14px;
            }

            h1 {
              font-size: 24px;
              margin: auto auto 16px auto;
              color: $brown;
              font-weight: bold;
            }

            p {
              margin: 0;
            }

            button {
              margin: 0 2px;
              padding: 4px 8px;
              font-size: 16px;
              font-weight: bold;
              color: #fff;
              border: none;
              border-radius: 5px;

              @include sm {
                font-size: 14px;
              }

              &:hover {
                cursor: pointer;
              }

              &.accept {
                background: $green-200;

                &:hover {
                  background: $green-100;
                }
              }

              &.decline {
                background: $red-200;

                &:hover {
                  background: $red-100;
                }
              }
            }

            table {
              width: 100%;
              margin: 25px auto;
              padding: 0;
              text-align: center;
              border-collapse: collapse;

              th {
                height: 25px;
                color: white;
                background: $bronze-200;
                border: none;
                padding: 10px;
                text-transform: uppercase;
              }

              tr:nth-child(even) {
                background: $grey-200;
              }

              td {
                padding: 2px 5px;
                height: 40px;

                &.title {
                  text-decoration: underline;
                }

                &.status {
                  text-transform: uppercase;
                  color: #e8b43a;

                  &.Accepted {
                    color: $green-200;
                  }

                  &.Declined {
                    color: $red-200;
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

export default Dashboard;
