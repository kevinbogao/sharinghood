import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import InlineError from '../../components/InlineError';
import Spinner from '../../components/Spinner';
import { GET_COMMUNITY } from '../../components/Navbar';

const FIND_COMMUNITY = gql`
  query Community($communityCode: String!) {
    community(communityCode: $communityCode) {
      _id
    }
  }
`;

const SELECT_COMMUNITY = gql`
  mutation SelectCommunity($communityId: ID) {
    selectCommunity(communityId: $communityId) @client
  }
`;

const CREATE_COMMUNITY = gql`
  mutation CreateCommunity($communityInput: CommunityInput!) {
    createCommunity(communityInput: $communityInput) {
      _id
    }
  }
`;

function CreateCommunity({ history, location }) {
  const { isLoggedIn } = location.state || { isLoggedIn: false };
  let name, code, zipCode;
  const [error, setError] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  // Find community & check if community code exists
  const [community, { loading }] = useLazyQuery(FIND_COMMUNITY, {
    onCompleted: ({ community }) => {
      // Set code error if community exists
      if (community) {
        setError({ code: 'Community code exists' });
      } else {
        history.push({
          pathname: '/find-community',
          state: {
            communityName: name.value,
            communityCode: code.value,
            communityZipCode: zipCode.value,
            isCreator: true,
          },
        });
      }
    },
    onError: ({ message }) => {
      setError({ community: message });
    },
  });

  // Set selectedCommunityId in cache & localStorage, refetch community
  // with selected communityId
  const [selectCommunity] = useMutation(SELECT_COMMUNITY, {
    refetchQueries: [
      {
        query: GET_COMMUNITY,
        variables: { communityId: selectedId },
      },
    ],
    onCompleted: () => {
      history.push('/find');
    },
  });

  // Create a new community for user
  const [createCommunity, { loading: mutationLoading }] = useMutation(
    CREATE_COMMUNITY,
    {
      onCompleted: ({ createCommunity }) => {
        // Set selected community id for refetching community query
        setSelectedId(createCommunity._id);

        // Call selectCommunity local mutation
        selectCommunity({
          variables: {
            communityId: createCommunity._id,
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
      <p className="main-p new">Give your community a name</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validate();
          if (Object.keys(errors).length === 0) {
            if (isLoggedIn) {
              console.log('djsakldj');
              createCommunity({
                variables: {
                  communityInput: {
                    name: name.value,
                    code: code.value,
                    zipCode: zipCode.value,
                  },
                },
              });
            } else {
              community({
                variables: {
                  communityCode: code.value,
                },
              });
            }
          }
        }}
      >
        <input
          type="text"
          className="main-input new"
          placeholder="Community Name"
          ref={(node) => {
            name = node;
          }}
        />
        {error.name && <InlineError text={error.name} />}
        <p className="main-p new">Create a unique code for your community</p>
        <input
          type="text"
          className="main-input new"
          placeholder="Community Code"
          ref={(node) => {
            code = node;
          }}
        />
        {error.code && <InlineError text={error.code} />}
        <p className="main-p new">Please enter your zip code</p>
        <input
          type="text"
          className="main-input new"
          placeholder="Zip code"
          ref={(node) => {
            zipCode = node;
          }}
        />
        {error.zipCode && <InlineError text={error.zipCode} />}
        <button className="main-btn new" type="submit">
          Next
        </button>
      </form>
      {loading && <Spinner isCover />}
      {mutationLoading && <Spinner isCover />}
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
  location: PropTypes.shape({
    state: PropTypes.shape({
      isLoggedIn: PropTypes.bool,
    }),
  }).isRequired,
};

export default CreateCommunity;
