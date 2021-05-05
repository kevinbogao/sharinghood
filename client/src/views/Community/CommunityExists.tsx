import { useState } from "react";
import { Location, History } from "history";
import { Redirect } from "react-router-dom";
import InlineError from "../../components/InlineError";
import profileImg from "../../assets/images/profile-img.png";
import uploadImg from "../../assets/images/upload.png";
import { typeDefs } from "../../utils/typeDefs";
import { validateForm, transformImgUrl, FormError } from "../../utils/helpers";

type State = {
  members?: Array<typeDefs.User>;
  isCreator: boolean;
  communityId?: string;
  communityName?: string;
  communityCode?: string;
  communityZipCode?: string;
};

interface CommunityExistsProps {
  location: Location<State>;
  history: History;
}

export default function CommunityExists({
  location: { state },
  history,
}: CommunityExistsProps) {
  let name: HTMLInputElement | null;
  let apartment: HTMLInputElement | null;
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<FormError>({});

  return !state ? (
    <Redirect push to="/" />
  ) : (
    <div className="community-exists-control">
      {!state.isCreator && (
        <>
          <p>Lucky you, your community already exists!</p>
          <p>This is your community</p>
          <h1>{state.communityName}</h1>
          <div className="community-members">
            {state.members?.map((member) => (
              <div key={member._id}>
                <div
                  className="member-img"
                  style={{
                    backgroundImage: `url(${transformImgUrl(
                      JSON.parse(member.image).secure_url,
                      200
                    )})`,
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
          const errors = validateForm({ name, apartment });
          setError(errors);
          if (Object.keys(errors).length === 0 && name && apartment) {
            history.push({
              pathname: "/register",
              state: {
                communityId: state.communityId,
                name: name.value,
                image: image || profileImg,
                apartment: apartment.value,
                isCreator: state.isCreator,
                communityName: state.communityName,
                communityCode: state.communityCode,
                communityZipCode: state.communityZipCode,
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
              if (e.currentTarget.files) {
                const reader = new FileReader();
                reader.readAsDataURL(e.currentTarget.files[0]);
                reader.onload = () => {
                  setImage(reader.result!.toString());
                };
              }
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
            pathname: "/login",
            state: { communityCode: state.communityZipCode },
          });
        }}
      >
        Login
      </button>
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

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

            label[for="file-input"] > img {
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
