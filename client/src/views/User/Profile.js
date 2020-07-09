import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation } from '@apollo/client';
import Loading from '../../components/Loading';
import UserPosts from '../../components/UserPosts';

const GET_USER = gql`
  query User {
    user {
      _id
      image
      name
      email
      apartment
      isAdmin
      communities {
        _id
      }
      posts {
        _id
        title
        image
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
    onError: ({ message }) => {
      console.log(message);
    },
  });
  const [updateUser, { loading: mutationLoading }] = useMutation(UPDATE_USER, {
    update(cache, { data: { updateUser } }) {
      cache.writeQuery({
        query: GET_USER,
        data: {
          user: updateUser,
        },
      });
      history.push('/find');
    },
    onError: ({ message }) => {
      console.log(message);
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
        {data.user.posts.length > 0 && (
          <UserPosts posts={data.user.posts} history={history} />
        )}
        <p className="main-p">Your name</p>
        <input
          className="main-input"
          defaultValue={data.user.name}
          onChange={(e) => setName(e.target.value)}
        />
        <p className="main-p">Email address</p>
        <input className="main-input" defaultValue={data.user.email} disabled />
        <p className="main-p">Where can the neighbours find you?</p>
        <input
          className="main-input"
          defaultValue={data.user.apartment}
          onChange={(e) => setApartment(e.target.value)}
        />
        <button className="main-btn block" type="submit">
          Save
        </button>
      </form>
      {mutationLoading && <Loading isCover />}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .profile-control {
            margin: auto;

            @include sm {
              max-width: 300px;
              width: 80vw;
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

            h2 {
              margin: 20px auto;
              font-size: 20xp;
            }

            .profile-pic-p {
              margin: 15px auto 0px auto;
              font-size: 14px;
              max-width: 300px;
            }

            .main-input {
              margin-top: 5px;
            }

            .main-p {
              margin: 20px auto 10px auto;
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
