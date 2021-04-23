import React, { useState } from "react";
import PropTypes from "prop-types";
import { useLazyQuery, useMutation } from "@apollo/client";
import InlineError from "../../components/InlineError";
import Spinner from "../../components/Spinner";
import { queries, mutations } from "../../utils/gql";
import { validateForm } from "../../utils/helpers";

function CreateCommunity({ history, location }) {
  const { isLoggedIn } = location.state || { isLoggedIn: false };
  let communityName, code, zipCode;
  const [error, setError] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  // Find community & check if community code exists
  const [community, { loading }] = useLazyQuery(queries.FIND_COMMUNITY, {
    onCompleted: ({ community }) => {
      // Set code error if community exists
      if (community) {
        setError({ code: "Community code exists" });
      } else {
        history.push({
          pathname: "/find-community",
          state: {
            communityName: communityName.value,
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
  const [selectCommunity] = useMutation(mutations.LOCAL_SELECT_COMMUNITY, {
    refetchQueries: [
      {
        query: queries.GET_CURRENT_COMMUNITY_AND_COMMUNITIES,
        variables: { communityId: selectedId },
      },
    ],
    onCompleted: () => {
      history.push("/find");
    },
  });

  // Create a new community for user
  const [createCommunity, { loading: mutationLoading }] = useMutation(
    mutations.CREATE_COMMUNITY,
    {
      onCompleted: ({ createCommunity }) => {
        // Set selected community id for re-fetching community query
        setSelectedId(createCommunity._id);

        // Call selectCommunity local mutation
        selectCommunity({
          variables: {
            communityId: createCommunity._id,
          },
        });
      },
      onError: ({ message }) => {
        const errMsgArr = message.split(": ");
        setError({ [errMsgArr[0]]: errMsgArr[1] });
      },
    }
  );

  return (
    <div className="create-community-control">
      <h1>You are a hero already!</h1>
      <h5>Create a community now and invite your members via link later.</h5>
      <p className="main-p new">Give your community a name</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validateForm(
            { communityName, code, zipCode },
            setError
          );
          if (Object.keys(errors).length === 0) {
            if (isLoggedIn) {
              createCommunity({
                variables: {
                  communityInput: {
                    name: communityName.value,
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
            communityName = node;
          }}
        />
        {error.communityName && <InlineError text={error.communityName} />}
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
          @import "./src/assets/scss/index.scss";

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
