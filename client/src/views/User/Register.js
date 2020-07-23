import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useMutation, useApolloClient } from '@apollo/client';
import jwtDecode from 'jwt-decode';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Loading from '../../components/Loading';
import InlineError from '../../components/InlineError';
import TermsAndConditions from '../../components/TermsAndConditions';

const MODAL_STYLE = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderWidth: 0,
    boxShadow: '0px 0px 6px #f2f2f2',
    padding: '30px 50px',
  },
};

const REGISTER_AND_OR_CREATE_COMMUNITY = gql`
  mutation RegisterAndOrCreateCommunity(
    $userInput: UserInput!
    $communityInput: CommunityInput
  ) {
    registerAndOrCreateCommunity(
      communityInput: $communityInput
      userInput: $userInput
    ) {
      user {
        accessToken
        refreshToken
      }
      community {
        _id
        name
        code
      }
    }
  }
`;

function Register({
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
  const client = useApolloClient();
  let email, password, confirmPassword, isNotified, agreed;
  const [error, setError] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [
    registerAndOrCreateCommunity,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(REGISTER_AND_OR_CREATE_COMMUNITY, {
    onCompleted: ({ registerAndOrCreateCommunity }) => {
      localStorage.setItem(
        '@sharinghood:accessToken',
        registerAndOrCreateCommunity.user.accessToken,
      );
      localStorage.setItem(
        '@sharinghood:refreshToken',
        registerAndOrCreateCommunity.user.refreshToken,
      );
      const tokenPayload = jwtDecode(
        registerAndOrCreateCommunity.user.accessToken,
      );
      client.writeQuery({
        query: gql`
          {
            accessToken
            refreshToken
            tokenPayload
          }
        `,
        data: {
          accessToken: registerAndOrCreateCommunity.user.accessToken,
          refreshToken: registerAndOrCreateCommunity.user.refreshToken,
          tokenPayload,
        },
      });

      // Redirect user to community invite link if user is creator
      // else redirect user to communities page (fromLogin state will
      // redirect user to find)
      if (isCreator) {
        history.push({
          pathname: '/community-link',
          state: {
            communityId: registerAndOrCreateCommunity.community._id,
            communityCode: registerAndOrCreateCommunity.community.code,
            isRegistered: false,
          },
        });
      } else {
        history.push({
          pathname: '/communities',
          state: {
            fromLogin: true,
          },
        });
      }
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  function validate() {
    const errors = {};
    if (!email.value) errors.email = 'Please enter your email address';
    else if (!/\S+@\S+\.\S+/.test(email.value))
      errors.email = 'Email address is invalid';
    if (!password.value) errors.password = 'Please enter your password';
    else if (password.value.length < 7)
      errors.password = 'Your password must be longer than 7 characters';
    if (password.value !== confirmPassword.value)
      errors.confirmPassword = 'Passwords do not match';
    if (!agreed.checked)
      errors.agreed = 'Please agree to the terms and conditions';
    setError(errors);
    return errors;
  }

  return (
    <div className="register-control">
      <p className="main-p">Thank you, you are a hero already!</p>
      <p className="main-p">Now create your login account.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validate();
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
            I agree to the{' '}
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
            pathname: '/login',
            state: { communityId },
          });
        }}
      >
        Login
      </button>
      <Modal
        id="terms-modal"
        style={MODAL_STYLE}
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
      {mutationLoading && <Loading isCover />}
      {mutationError && <p>Error :( Please try again</p>}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

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
          @import './src/assets/scss/index.scss';

          #terms-modal {
            max-width: $xl-max-width;
            max-height: 70vh;
            padding: 30px 50px;

            @include xl {
              width: 80vw;
            }

            @include sm {
              max-height: 85vh;
              padding: 20px;
            }
          }

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

export default Register;
