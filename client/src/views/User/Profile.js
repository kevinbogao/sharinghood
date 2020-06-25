import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation } from '@apollo/client';
import Loading from '../../components/Loading';

const GET_USER = gql`
  query User {
    user {
      _id
      image
      name
      email
      apartment
      communities {
        _id
      }
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($userInput: UserInput) {
    updateUser(userInput: $userInput) {
      _id
      name
      image
      email
      apartment
    }
  }
`;

function Profile({ history }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [apartment, setApartment] = useState('');
  const { data, error, loading } = useQuery(GET_USER, {
    onCompleted: () => {
      console.log(data);
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });
  const [updateUser, { loading: mutationLoading }] = useMutation(UPDATE_USER, {
    onError: ({ message }) => {
      console.log(message);
    },
    update(cache, { data: { updateUser } }) {
      cache.writeQuery({
        query: GET_USER,
        data: {
          user: updateUser,
        },
      });
      history.push('/find');
    },
  });

  return loading ? (
    <Loading />
  ) : error ? (
    `Error ${error.message}`
  ) : (
    <div className="profile-control">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Redirect to posts page if no changes were made
          if (!name && !apartment && !image) {
            history.push('/find');
          } else {
            updateUser({
              variables: {
                userInput: {
                  ...(name && { name }),
                  ...(image && { image }),
                  ...(apartment && { apartment }),
                },
              },
            });
          }
        }}
      >
        <h2>Your profile</h2>
        <div className="image-upload">
          <label htmlFor="file-input">
            <img
              alt="profile pic"
              src={image || JSON.parse(data.user.image).secure_url}
            />
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
        <p className="profile-pic-p">
          Pictures increase trust by 80%. Feel free to make your profile more
          trustworthy by uploading a picture.
        </p>
        <p className="prev-p">Your name</p>
        <input
          className="prev-input"
          defaultValue={data.user.name}
          onChange={(e) => setName(e.target.value)}
        />
        <p className="prev-p">Email address</p>
        <input className="prev-input" defaultValue={data.user.email} disabled />
        <p className="prev-p">Where can the neighbours find you?</p>
        <input
          className="prev-input"
          defaultValue={data.user.apartment}
          onChange={(e) => setApartment(e.target.value)}
        />
        <button className="prev-btn" type="submit">
          Save
        </button>
      </form>
      {mutationLoading && <Loading isCover />}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .profile-control {
            margin: auto;

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

            @include sm {
              max-width: 300px;
              width: 80vw;
            }

            h2 {
              margin: 20px auto;
              color: $bronze-200;
              font-size: 20xp;
            }

            .profile-pic-p {
              margin: 15px auto 0px auto;
              color: $brown;
              font-size: 14px;
              max-width: 300px;
            }

            .prev-p {
              margin: 20px auto;
              max-width: 300px;
            }

            .prev-btn {
              display: block;
              margin: 30px auto;
            }
          }
        `}
      </style>
    </div>
  );
}

Profile.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    location: PropTypes.shape({
      state: PropTypes.shape({
        creatorName: PropTypes.string,
      }),
    }),
  }).isRequired,
};

export default Profile;
