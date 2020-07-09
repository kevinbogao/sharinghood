import React, { useState } from 'react';
import PropTypes from 'prop-types';
import InlineError from '../../components/InlineError';
import profileImg from '../../assets/images/profile-img.png';
import uploadImg from '../../assets/images/upload.png';

function CommunityExists({
  location: {
    state: {
      members,
      communityId,
      communityName,
      communityCode,
      communityZipCode,
      isCreator,
    },
  },
  history,
}) {
  let name;
  let apartment;
  const [image, setImage] = useState(null);
  const [error, setError] = useState({});

  function validate() {
    const errors = {};
    if (name.value === '') errors.name = 'Please enter your name';
    if (apartment.value === '') {
      errors.apartment = 'Please enter your floor or house number';
    }
    setError(errors);
    return errors;
  }

  return (
    <div className="community-exists-control">
      {!isCreator && (
        <>
          <p>Lucky you, your community already exists!</p>
          <p>This is your community</p>
          <h1>{communityName}</h1>
          <div className="community-members">
            {members.map((member) => (
              <div key={member._id}>
                <div
                  className="member-img"
                  style={{
                    backgroundImage: `url(${
                      JSON.parse(member.image).secure_url
                    })`,
                  }}
                />
              </div>
            ))}
          </div>
        </>
      )}
      <p>How shall they call you?</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validate();
          if (Object.keys(errors).length === 0) {
            history.push({
              pathname: '/register',
              state: {
                communityId,
                name: name.value,
                image: image || profileImg,
                apartment: apartment.value,
                isCreator,
                communityName,
                communityCode,
                communityZipCode,
              },
            });
          }
        }}
      >
        <input
          type="text"
          className="main-input"
          placeholder="Name"
          ref={(node) => {
            name = node;
          }}
        />
        {error.name && <InlineError text={error.name} />}
        <p>
          Pictures increase trust by 80% Feel free to make your profile more
          trustworthy by uploading a picture.
        </p>
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
        <p>Where can the neighbours find you?</p>
        <input
          type="text"
          className="main-input"
          placeholder="Floor or house number"
          ref={(node) => {
            apartment = node;
          }}
        />
        {error.apartment && <InlineError text={error.apartment} />}
        <button className="main-btn" type="submit">
          Continue
        </button>
      </form>
      <p className="p-center">Already have an account</p>
      <button
        className="login-btn"
        type="button"
        onClick={() => {
          history.push({
            pathname: '/login',
            state: { communityCode },
          });
        }}
      >
        Login
      </button>
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .community-exists-control {
            margin: auto;

            p {
              margin: 16px 0;
              font-size: 16px;
              color: $black;
              max-width: 300px;
            }

            .p-center {
              text-align: center;
              margin-bottom: 3px;
            }

            h1 {
              margin: 20px auto;
              color: $orange;
              max-width: 300px;
            }

            .image-upload > input {
              display: none;
            }

            label[for='file-input'] > img {
              cursor: pointer;
              height: 100px;
              width: 100px;
              border-radius: 50%;
              box-shadow: 1px 1px 1px 1px #eeeeee;
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

            .main-btn {
              margin: 30px auto 15px auto;
            }

            .community-members {
              max-width: 260px;
              overflow-x: scroll;
              display: flex;

              .member-img {
                margin: 0 5px 0 0;
                height: 60px;
                width: 60px;
                border-radius: 50%;
                background-size: cover;
                background-position: center;
              }
            }
          }
        `}
      </style>
    </div>
  );
}

CommunityExists.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      members: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string.isRequired,
          image: PropTypes.string.isRequired,
        }),
      ),
      isCreator: PropTypes.bool.isRequired,
      communityId: PropTypes.string,
      communityName: PropTypes.string,
      communityCode: PropTypes.string,
      communityZipCode: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default CommunityExists;
