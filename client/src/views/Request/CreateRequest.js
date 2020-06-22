import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useMutation } from '@apollo/client';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import InlineError from '../../components/InlineError';
import Loading from '../../components/Loading';
import uploadImg from '../../assets/images/upload.png';
import { GET_REQUESTS } from './Requests';

const CREATE_REQUEST = gql`
  mutation CreateRequest($requestInput: RequestInput!) {
    createRequest(requestInput: $requestInput) {
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

function CreateRequest({ history }) {
  let title, desc;
  const [image, setImage] = useState(null);
  const [dateNeed, setDateNeed] = useState(new Date());
  const [dateReturn, setDateReturn] = useState(new Date());
  const [error, setError] = useState({});
  const [
    createRequest,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(CREATE_REQUEST, {
    update(cache, { data: { createRequest } }) {
      // Try catch block to avoid empty requests cache error
      try {
        const { requests } = cache.readQuery({
          query: GET_REQUESTS,
        });
        cache.writeQuery({
          query: GET_REQUESTS,
          data: { requests: requests.concat([createRequest]) },
        });
      } catch (err) {
        console.log(err);
      }
      history.push('/requests');
    },
  });

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
          className="prev-input desc"
          name="title"
          placeholder="Title"
          ref={(node) => (title = node)}
        />
        {error.title && <InlineError text={error.title} />}
        <input
          className="prev-input desc"
          placeholder="Description"
          ref={(node) => (desc = node)}
        />
        {error.desc && <InlineError text={error.desc} />}
        {error.descExists && <InlineError text={error.descExists} />}
        <p className="prev-p">Set a date by which you need to have this item</p>
        <DatePicker
          className="prev-input date"
          selected={dateNeed}
          onChange={(date) => setDateNeed(date)}
          dateFormat="yyyy.MM.dd"
          minDate={new Date()}
        />
        <p className="prev-p">Till when do you want to borrow this item?</p>
        <DatePicker
          className="prev-input date"
          selected={dateReturn}
          onChange={(date) => setDateReturn(date)}
          dateFormat="yyyy.MM.dd"
          minDate={dateNeed}
        />
        <button className="prev-btn" type="submit">
          Request
        </button>
      </form>
      {mutationLoading && <Loading isCover />}
      {mutationError && <p>Error :( Please try again</p>}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .request-control {
            margin: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            // width: 80vw;

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

            .prev-p {
              max-width: 280px;
              font-size: 19px;
              margin: 20px 0;
            }

            .desc {
              margin-top: 30px;
            }

            .prev-btn {
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
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default CreateRequest;
