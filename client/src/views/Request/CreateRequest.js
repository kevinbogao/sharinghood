import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useMutation } from '@apollo/client';
import moment from 'moment';
import DatePicker from '../../components/DatePicker';
import InlineError from '../../components/InlineError';
import Spinner from '../../components/Spinner';
import uploadImg from '../../assets/images/upload.png';
import { GET_REQUESTS } from './Requests';

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
  const [image, setImage] = useState(null);
  const [error, setError] = useState({});
  const [dateType, setDateType] = useState(0);
  const [dateNeed, setDateNeed] = useState(moment());
  const [dateReturn, setDateReturn] = useState(moment());

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
                  dateType,
                  ...(dateType === 2 && { dateNeed, dateReturn }),
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
        <DatePicker
          dateType={dateType}
          dateNeed={dateNeed}
          dateReturn={dateReturn}
          setDateType={setDateType}
          setDateNeed={setDateNeed}
          setDateReturn={setDateReturn}
        />
        {error.res && <InlineError text={error.res} />}
        <button className="main-btn" type="submit">
          Request
        </button>
      </form>
      {mutationLoading && <Spinner isCover />}
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
