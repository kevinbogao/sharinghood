import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { gql, useMutation } from '@apollo/client';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import DatePicker from 'react-datepicker';
import { DateRangePicker } from 'react-dates';
import moment from 'moment';
import InlineError from '../../components/InlineError';
import Loading from '../../components/Loading';
import uploadImg from '../../assets/images/upload.png';
import { GET_REQUESTS } from './Requests';

// import Thing from './DatePicker';

const CREATE_REQUEST = gql`
  mutation CreateRequest($requestInput: RequestInput!, $communityId: ID!) {
    createRequest(requestInput: $requestInput, communityId: $communityId) {
      _id
      desc
      image
      dateNeed
      creator {
        _id
        name
      }
    }
  }
`;

function CreateRequest({ communityId, history }) {
  let title, desc;
  const [isMobile, setIsMobile] = useState(false);
  const [image, setImage] = useState(null);
  const [dateType, setDateType] = useState(0);
  const [dateNeed, setDateNeed] = useState(new Date());

  console.log(dateNeed);

  const [dateReturn, setDateReturn] = useState(new Date());
  const [error, setError] = useState({});

  const [startDate, setStartDate] = useState(moment());

  console.log(new Date(startDate));

  const [endDate, setEndDate] = useState(moment());
  const [focusedInput, setFocusedInput] = useState(null);

  // Set isMobile boolean value based on window width
  useEffect(() => {
    function handleWindowResize() {
      setIsMobile(window.matchMedia('(max-width: 576px)').matches);
    }

    window.addEventListener('resize', handleWindowResize);

    // Return a function from the effect that removes the event listener
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  const [createRequest, { loading: mutationLoading }] = useMutation(
    CREATE_REQUEST,
    {
      update(cache, { data: { createRequest } }) {
        // Try catch block to avoid empty requests cache error
        try {
          const { requests } = cache.readQuery({
            query: GET_REQUESTS,
            variables: { communityId },
          });
          cache.writeQuery({
            query: GET_REQUESTS,
            variables: { communityId },
            data: { requests: [createRequest, ...requests] },
          });
        } catch (err) {
          console.log(err);
        }
        history.push('/requests');
      },
      onError: () => {
        setError({
          res:
            'We are experiencing difficulties right now :( Please try again later',
        });
      },
    },
  );

  function validate() {
    const errors = {};
    if (!title.value) errors.title = 'Please enter a title';
    if (!desc.value) errors.desc = 'Please enter a description';
    if (!image) errors.image = 'Please upload a picture of the item';
    setError(errors);
    return errors;
  }

  return (
    <div className="request-control">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validate();
          if (Object.keys(errors).length === 0) {
            createRequest({
              variables: {
                requestInput: {
                  title: title.value,
                  desc: desc.value,
                  image,
                  dateNeed,
                  dateReturn,
                },
                communityId,
              },
            });
          }
        }}
      >
        <div className="image-upload">
          <label htmlFor="file-input">
            <img alt="profile pic" src={image || uploadImg} />
          </label>
          <input
            id="file-input"
            className="FileInput"
            type="file"
            onChange={(e) => {
              const reader = new FileReader();
              reader.readAsDataURL(e.target.files[0]);
              reader.onload = () => {
                setImage(reader.result);
              };
            }}
          />
        </div>
        {error.image && <InlineError text={error.image} />}
        <input
          className="main-input"
          name="title"
          placeholder="Title"
          ref={(node) => (title = node)}
        />
        {error.title && <InlineError text={error.title} />}
        <input
          className="main-input"
          placeholder="Description"
          ref={(node) => (desc = node)}
        />
        {error.desc && <InlineError text={error.desc} />}
        {error.descExists && <InlineError text={error.descExists} />}
        <p className="main-p">When do you need the item?</p>
        <select
          name="dateType"
          className="main-select"
          onChange={(e) => setDateType(+e.target.value)}
        >
          <option value="0">As soon as possible</option>
          <option value="1">No timeframe</option>
          <option value="2">Select timeframe</option>
        </select>
        <DatePicker
          className="main-input date"
          selected={dateNeed}
          onChange={(date) => setDateNeed(date)}
          dateFormat="yyyy.MM.dd"
          minDate={new Date()}
        />
        {dateType === 2 && (
          <>
            <p className="main-p">Please select a timeframe</p>
            <DateRangePicker
              startDate={startDate}
              startDateId="your_unique_start_date_id"
              endDate={endDate}
              endDateId="your_unique_end_date_id"
              onDatesChange={({ startDate, endDate }) => {
                setStartDate(startDate);
                setEndDate(endDate);
              }}
              focusedInput={focusedInput}
              onFocusChange={(focusedInput) => setFocusedInput(focusedInput)}
              orientation={isMobile ? 'vertical' : 'horizontal'}
              withFullScreenPortal={!!isMobile}
              displayFormat="yyyy.MM.DD"
              hideKeyboardShortcutsPanel
            />
          </>
        )}
        {error.res && <InlineError text={error.res} />}
        <button className="main-btn" type="submit">
          Request
        </button>
      </form>
      {mutationLoading && <Loading isCover />}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .request-control {
            margin: auto;
            display: flex;
            align-items: center;
            justify-content: center;

            @include sm {
              max-width: 300px;
            }

            .image-upload > input {
              display: none;
            }

            img {
              margin-top: 30px;
              border-radius: 4px;
              width: 148px;
              height: 180px;
              object-fit: contain;
              box-shadow: 1px 1px 1px 1px #eeeeee;
            }

            .main-input {
              &.date {
                margin: 0 auto;
              }
            }

            .main-p {
              max-width: 280px;
              font-size: 19px;
              margin: 20px 0;
            }

            .main-btn {
              margin: 40px 0 30px 0;
              display: block;
            }
          }
        `}
      </style>
      <style jsx global>
        {`
          @import './src/assets/scss/index.scss';

          .DateRangePicker {
            display: block;
            margin: 20px auto;
          }

          .DateInput {
            width: 127px;
            position: static;
          }

          .DateInput_input {
            color: #a0998f;
            font-size: 20px;
            background: $grey-000;
          }

          .DateInput_input__focused {
            border-bottom: 2px solid $orange;
          }

          .DateRangePickerInput__withBorder {
            border: none;
            background: $grey-000;
          }

          .DayPickerNavigation__verticalDefault {
            display: flex;
          }

          .CalendarDay__selected_span {
            background: $beige;
            border: 1px double $beige-100;
          }

          .CalendarDay__selected,
          .CalendarDay__selected:active,
          .CalendarDay__selected:hover {
            background: $orange;
            border: 1px double $orange;
          }

          .CalendarDay__selected_span:hover {
            background: $beige-100;
            border: 1px double $beige-100;
          }

          .CalendarDay__hovered_span,
          .CalendarDay__hovered_span:hover {
            color: $black;
            background: $beige;
            border: 1px double $beige-100;
          }
        `}
      </style>
    </div>
  );
}

CreateRequest.propTypes = {
  communityId: PropTypes.string.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default CreateRequest;
