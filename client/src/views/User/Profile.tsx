import { useState, ChangeEvent } from "react";
import { History } from "history";
import { useQuery, useMutation } from "@apollo/client";
import Spinner from "../../components/Spinner";
import ProfilePosts from "../../components/ProfilePosts";
import ServerError from "../../components/ServerError";
import { queries, mutations } from "../../utils/gql";
import { typeDefs } from "../../utils/typeDefs";
import { transformImgUrl } from "../../utils/helpers";

interface ProfileProps {
  history: History;
}

export default function Profile({ history }: ProfileProps) {
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isNotified, setIsNotified] = useState(false);
  const [apartment, setApartment] = useState("");
  const { loading, data, error } = useQuery<typeDefs.UserData, void>(
    queries.GET_USER,
    {
      onCompleted: ({ user }) => {
        setIsNotified(user.isNotified);
      },
      onError: ({ message }) => {
        console.log(message);
      },
    }
  );
  const [updateUser, { loading: mutationLoading }] = useMutation(
    mutations.UPDATE_USER,
    {
      update(cache, { data: { updateUser } }) {
        cache.writeQuery({
          query: queries.GET_USER,
          data: {
            user: updateUser,
          },
        });
        history.push("/find");
      },
      onError: ({ message }) => {
        console.log(message);
      },
    }
  );

  return loading ? (
    <Spinner />
  ) : error ? (
    <ServerError />
  ) : (
    <div className="profile-control">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Redirect to posts page if no changes were made
          if (
            !name &&
            !apartment &&
            !image &&
            data?.user.isNotified === isNotified
          ) {
            history.push("/find");
          } else {
            updateUser({
              variables: {
                userInput: {
                  ...(name && { name }),
                  ...(image && { image }),
                  ...(apartment && { apartment }),
                  ...(data?.user.isNotified !== isNotified && { isNotified }),
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
              src={
                image ||
                (data?.user.image &&
                  transformImgUrl(JSON.parse(data.user.image).secure_url, 300))
              }
            />
          </label>
          <input
            id="file-input"
            className="FileInput"
            type="file"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const reader = new FileReader();
              if (e.currentTarget.files) {
                reader.readAsDataURL(e.currentTarget.files[0]);
                reader.onload = () => {
                  setImage(reader.result!.toString());
                };
              }
            }}
          />
        </div>
        <p className="profile-pic-p">
          Pictures increase trust by 80%. Feel free to make your profile more
          trustworthy by uploading a picture.
        </p>
        {data && data.user.posts.length > 0 && (
          <ProfilePosts posts={data.user.posts} history={history} />
        )}
        <p className="main-p">Your name</p>
        <input
          className="main-input"
          defaultValue={data?.user.name}
          onChange={(e) => setName(e.target.value)}
        />
        <p className="main-p">Email address</p>
        <input
          className="main-input"
          defaultValue={data?.user.email}
          disabled
        />
        <p className="main-p">Where can the neighbours find you?</p>
        <input
          className="main-input"
          defaultValue={data?.user.apartment}
          onChange={(e) => setApartment(e.target.value)}
        />
        <div className="notifications-toggle">
          <p className="email-toggle-text">Receive notifications</p>
          <label className="switch">
            <input
              type="checkbox"
              checked={isNotified || false}
              onChange={() => setIsNotified(!isNotified)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <button className="main-btn block" type="submit">
          Save
        </button>
      </form>
      {mutationLoading && <Spinner isCover />}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .profile-control {
            margin: auto;

            @include sm {
              max-width: 300px;
              width: 80vw;
            }

            h2 {
              @include sm {
                margin-top: 30px;
              }
            }

            .image-upload > input {
              display: none;
            }

            label[for="file-input"] > img {
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

            .main-btn {
              margin-bottom: 40px;
            }

            .notifications-toggle {
              display: flex;
              margin-top: 30px;
              align-items: center;
              justify-content: space-between;

              .email-toggle-text {
                font-size: 20px;
                max-width: 70%;
              }
            }

            .switch {
              position: relative;
              display: inline-block;
              width: 55px;
              height: 28px;
            }

            .switch input {
              opacity: 0;
              width: 0;
              height: 0;
            }

            .slider {
              position: absolute;
              cursor: pointer;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: #f2f2f2;
              -webkit-transition: 0.25s;
              transition: 0.25s;
              border-radius: 34px;

              &:before {
                position: absolute;
                content: "";
                height: 20px;
                width: 20px;
                /* left: 3px; */
                /* bottom: 3px; */
                left: 4px;
                bottom: 4px;
                background-color: white;
                -webkit-transition: 0.25s;
                transition: 0.25s;
                border-radius: 50%;
              }
            }

            input:checked + .slider {
              background-color: $orange;
            }

            input:focus + .slider {
              box-shadow: 0 0 1px $orange;
            }

            input:checked + .slider:before {
              -webkit-transform: translateX(27px);
              -ms-transform: translateX(27px);
              transform: translateX(27px);
            }
          }
        `}
      </style>
    </div>
  );
}
