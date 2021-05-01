import { useState } from "react";
import PropTypes from "prop-types";
import { useMutation } from "@apollo/client";
import jwtDecode from "jwt-decode";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Spinner from "../../components/Spinner";
import InlineError from "../../components/InlineError";
import TermsAndConditions from "../../components/TermsAndConditions";
import { mutations } from "../../utils/gql";
import {
  accessTokenVar,
  refreshTokenVar,
  tokenPayloadVar,
} from "../../utils/cache";
import { validateForm } from "../../utils/helpers";

export default function Register({
  location: {
    state: {
      name,
      image,
      apartment,
      isCreator,
      communityId,
      communityName,
      communityCode,
      communityZipCode,
    },
  },
  history,
}) {
  let email, password, confirmPassword, isNotified, agreed;
  const [error, setError] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [
    registerAndOrCreateCommunity,
    { loading: mutationLoading },
  ] = useMutation(mutations.REGISTER_AND_OR_CREATE_COMMUNITY, {
    onCompleted: async ({ registerAndOrCreateCommunity }) => {
      console.log(registerAndOrCreateCommunity);

      const tokenPayload = await jwtDecode(
        registerAndOrCreateCommunity.user.accessToken
      );
      localStorage.setItem(
        "@sharinghood:accessToken",
        registerAndOrCreateCommunity.user.accessToken
      );
      localStorage.setItem(
        "@sharinghood:refreshToken",
        registerAndOrCreateCommunity.user.refreshToken
      );
      accessTokenVar(registerAndOrCreateCommunity.user.accessToken);
      refreshTokenVar(registerAndOrCreateCommunity.user.refreshTokenVar);
      tokenPayloadVar(tokenPayload);

      // Redirect user to community invite link if user is creator
      // else redirect user to communities page (fromLogin state will
      // redirect user to find)
      if (isCreator) {
        history.push({
          pathname: "/community-link",
          state: {
            communityId: registerAndOrCreateCommunity.community._id,
            communityCode: registerAndOrCreateCommunity.community.code,
            isRegistered: false,
          },
        });
      } else {
        history.push({
          pathname: "/communities",
          state: {
            fromLogin: true,
          },
        });
      }
    },

    onError: (err) => {
      console.log(err);
    },
    // onError: ({ message }) => {
    //   const errMsgArr = message.split(": ");
    //   setError({ [errMsgArr[0]]: errMsgArr[1] });
    // },
  });

  return (
    <div className="register-control">
      <p className="main-p">Thank you, you are a hero already!</p>
      <p className="main-p">Now create your login account.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validateForm(
            { email, password, confirmPassword, agreed },
            setError
          );
          if (Object.keys(errors).length === 0) {
            registerAndOrCreateCommunity({
              variables: {
                userInput: {
                  name,
                  email: email.value.toLowerCase(),
                  password: password.value,
                  image,
                  apartment,
                  isNotified: isNotified.checked,
                  isCreator,
                  communityId,
                },
                ...(isCreator && {
                  communityInput: {
                    name: communityName,
                    code: communityCode,
                    zipCode: communityZipCode,
                  },
                }),
              },
            });
          }
        }}
      >
        <input
          type="text"
          className="main-input"
          placeholder="Email"
          ref={(node) => (email = node)}
        />
        {error.email && <InlineError text={error.email} />}
        {error.emailExists && <InlineError text={error.emailExists} />}
        <input
          type="password"
          className="main-input"
          placeholder="Password"
          ref={(node) => (password = node)}
        />
        {error.password && <InlineError text={error.password} />}
        <input
          type="password"
          className="main-input"
          placeholder="Confirm Password"
          ref={(node) => (confirmPassword = node)}
        />
        {error.confirmPassword && <InlineError text={error.confirmPassword} />}
        <div className="register-terms">
          <input
            type="checkbox"
            defaultChecked
            ref={(node) => (isNotified = node)}
          />
          <p>
            I want to get notified when my neighbours request and share items
          </p>
        </div>
        <div className="register-terms">
          <input type="checkbox" ref={(node) => (agreed = node)} />
          <p>
            I agree to the{" "}
            <button
              type="button"
              className="terms-btn"
              onClick={() => setIsModalOpen(true)}
            >
              terms and conditions
            </button>
          </p>
        </div>
        {error.agreed && <InlineError text={error.agreed} />}
        <button className="main-btn" type="submit">
          Register
        </button>
      </form>
      <p className="p-center">Already have an account</p>
      <button
        className="login-btn"
        type="button"
        onClick={() => {
          history.push({
            pathname: "/login",
            state: { communityId },
          });
        }}
      >
        Login
      </button>
      <Modal
        className="react-modal terms"
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <FontAwesomeIcon
          className="terms-times-icon"
          icon={faTimes}
          onClick={() => setIsModalOpen(false)}
          size="lg"
        />
        <TermsAndConditions />
      </Modal>
      {mutationLoading && <Spinner isCover />}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .register-control {
            margin: auto;

            @include sm {
              max-width: 300px;
            }

            .p-center {
              margin: 16px 0;
              font-size: 16px;
              color: $black;
              max-width: 300px;
              text-align: center;
              margin-bottom: 3px;
            }

            .main-btn {
              margin: 20px auto 15px auto;
            }

            button.login-btn {
              display: block;
              margin: auto auto 30px auto;
              padding: 0;
              border: none;
              font-size: 16px;
              color: $orange;
              text-align: center;
              background: $background;
              text-decoration: underline;

              &:hover {
                cursor: pointer;
              }
            }

            .register-terms {
              display: flex;

              p {
                margin: 14px 0;
                font-size: 16px;
                color: $black;
                max-width: 280px;
              }

              input {
                margin: 20px 10px 0 0;
              }
            }

            button.terms-btn {
              all: initial;
              border: none;
              margin: 0px !important;
              color: $beige;
              font-family: $font-stack;
              text-decoration: underline;

              &:hover {
                cursor: pointer;
              }
            }
          }
        `}
      </style>
      <style jsx global>
        {`
          @import "./src/assets/scss/index.scss";

          .terms-times-icon {
            position: -webkit-sticky;
            position: sticky;
            top: 0px;
            float: right;

            &:hover {
              poster: cursor;
            }
          }
        `}
      </style>
    </div>
  );
}

Register.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      apartment: PropTypes.string.isRequired,
      isCreator: PropTypes.bool.isRequired,
      communityId: PropTypes.string,
      communityName: PropTypes.string,
      communityCode: PropTypes.string,
      communityZipCode: PropTypes.string,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};
