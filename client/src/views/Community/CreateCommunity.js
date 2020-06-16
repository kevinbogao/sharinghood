import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useMutation } from '@apollo/client';
import InlineError from '../../components/InlineError';
import Loading from '../../components/Loading';

const CREATE_COMMUNITY = gql`
  mutation CreateCommunity($communityInput: CommunityInput!) {
    createCommunity(communityInput: $communityInput) {
      _id
      name
      code
    }
  }
`;

function CreateCommunity({ history }) {
  let name, code, zipCode;
  const [error, setError] = useState({});
  const [createCommunity, { loading: mutationLoading }] = useMutation(
    CREATE_COMMUNITY,
    {
      onCompleted: ({ createCommunity }) => {
        history.push({
          pathname: '/community-link',
          state: {
            communityId: createCommunity._id,
            communityCode: createCommunity.code,
            isCreator: true,
            isRegistered: false,
          },
        });
      },
      onError: ({ message }) => {
        setError({ code: message });
      },
    },
  );

  function validate() {
    const errors = {};
    if (!code.value) errors.code = 'Please enter a community code';
    else if (/[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(code.value))
      errors.code = 'Please only use standard alphanumerics';
    if (!name.value) errors.name = 'Please enter a community name';
    if (!zipCode.value) errors.zipCode = 'Please enter your zip code';
    setError(errors);
    return errors;
  }

  return (
    <div className="create-community-control">
      <h1>You are a hero already!</h1>
      <h5>Create a community now and invite your members via link later.</h5>
      <p className="main-p">Give your community a name</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validate();
          if (Object.keys(errors).length === 0) {
            createCommunity({
              variables: {
                communityInput: {
                  name: name.value,
                  code: code.value,
                  zipCode: zipCode.value,
                },
              },
            });
          }
        }}
      >
        <input
          type="text"
          className="main-input"
          placeholder="Community Name"
          ref={(node) => {
            name = node;
          }}
        />
        {error.name && <InlineError text={error.name} />}
        <p className="main-p">Create a unique code for your community</p>
        <input
          type="text"
          className="main-input"
          placeholder="Community Code"
          ref={(node) => {
            code = node;
          }}
        />
        {error.code && <InlineError text={error.code} />}
        <p className="main-p">Please enter your zip code</p>
        <input
          type="text"
          className="main-input"
          placeholder="Zip code"
          ref={(node) => {
            zipCode = node;
          }}
        />
        {error.zipCode && <InlineError text={error.zipCode} />}
        <button className="main-btn" type="submit">
          Next
        </button>
      </form>
      {mutationLoading && <Loading isCover />}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .create-community-control {
            margin: auto;
            box-shadow: 0px 0px 10px $grey-200;
            padding: 20px 30px;
            max-width: 300px;

            @include sm {
              max-width: 80vw;
              padding: 0;
              box-shadow: none;
            }

            h1 {
              margin: 13px 0;
              font-size: 20px;
              font-weight: bold;
              color: $black;

              @include sm {
                max-width: 240px;
              }
            }

            h5 {
              margin: 0 0 40px 0;
              font-size: 15px;
              color: $black;

              @include sm {
                max-width: 240px;
              }
            }

            .main-p {
              margin: 14px 0 7px 0;

              @include sm {
                max-width: 240px;
              }
            }
          }
        `}
      </style>
    </div>
  );
}

CreateCommunity.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default CreateCommunity;
