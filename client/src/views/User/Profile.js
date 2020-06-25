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

const INACTIVATE_POST = gql`
  mutation InactivatePost($postId: ID!) {
    inactivatePost(postId: $postId)
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
  const [inactivatePost] = useMutation(INACTIVATE_POST, {
    onCompleted: (data) => {
      console.log(data);
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
        <p className="prev-p">Items you shared</p>
        <div className="user-posts">
          {data.user.posts.map((post) => (
            <div key={post._id}>
              <img src={JSON.parse(post.image).secure_url} alt="" />
              <span>{post.title}</span>
              <button type="button">Edit</button>
              <button
                type="button"
                onClick={() => {
                  inactivatePost({
                    // TODO: remove from local state if exists
                    variables: { postId: post._id },
                  });
                }}
              >
                Set inactive
              </button>
            </div>
          ))}
        </div>
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

            .user-posts {
              max-width: 300px;
              overflow-x: scroll;
              display: flex;

              img {
                margin: 0 5px 0 0;
                width: 160px;
                height: 136px;
                object-fit: cover;
              }
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
