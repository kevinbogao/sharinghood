import { useState } from "react";
import { Location, History } from "history";
import { useLazyQuery, useMutation } from "@apollo/client";
import InlineError from "../../components/InlineError";
import Spinner from "../../components/Spinner";
import { queries, mutations } from "../../utils/gql";
import { typeDefs } from "../../utils/typeDefs";
import { selCommunityIdVar } from "../../utils/cache";
import { validateForm, FormError } from "../../utils/helpers";

type State = { isLoggedIn?: boolean };

interface CreateCommunityProps {
  history: History;
  location: Location<State>;
}

export default function CreateCommunity({
  history,
  location,
}: CreateCommunityProps) {
  const { isLoggedIn } = location.state || { isLoggedIn: false };
  let communityName: HTMLInputElement | null;
  let code: HTMLInputElement | null;
  let zipCode: HTMLInputElement | null;
  const [error, setError] = useState<FormError>({});

  // Find community & check if community code exists
  const [community, { loading }] = useLazyQuery<
    typeDefs.FindCommunityData,
    typeDefs.FindCommunityVars
  >(queries.FIND_COMMUNITY, {
    onCompleted: ({ community }) => {
      // Set code error if community exists
      if (community) {
        setError({ code: "Community code exists" });
      } else {
        history.push({
          pathname: "/find-community",
          state: {
            communityName: communityName?.value,
            communityCode: code?.value,
            communityZipCode: zipCode?.value,
            isCreator: true,
          },
        });
      }
    },
    onError: ({ message }) => {
      setError({ community: message });
    },
  });

  // Create a new community for user
  const [createCommunity, { loading: mutationLoading }] = useMutation<
    typeDefs.CreateCommunityData,
    typeDefs.CreateCommunityVars
  >(mutations.CREATE_COMMUNITY, {
    onCompleted: ({ createCommunity }) => {
      // Set community id to localStorage, change community id cache
      // & redirect to /find
      localStorage.setItem("@sharinghood:selCommunityId", createCommunity._id);
      selCommunityIdVar(createCommunity._id);
      history.push("/find");
    },
    onError: ({ message }) => {
      const errMsgArr = message.split(": ");
      setError({ [errMsgArr[0]]: errMsgArr[1] });
    },
  });

  return (
    <div className="create-community-control">
      <h1>You are a hero already!</h1>
      <h5>Create a community now and invite your members via link later.</h5>
      <p className="main-p new">Give your community a name</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validateForm({ communityName, code, zipCode });
          setError(errors);
          if (
            Object.keys(errors).length === 0 &&
            communityName &&
            code &&
            zipCode
          ) {
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
