import { useRouter, withRouter } from "next/router";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import { useForm, FormProvider } from "react-hook-form";
import jwtDecode from "jwt-decode";
import Modal from "react-modal";
import ImageInput from "../components/ImageInput";
import { InlineError, Loader, SVG } from "../components/Container";
import Terms from "../components/Terms";
import { types } from "../lib/types";
import { transformImgUrl, handlerInputError } from "../lib";
import { queries, mutations } from "../lib/gql";
import {
  accessTokenVar,
  refreshTokenVar,
  tokenPayloadVar,
  createCommunityDataVar,
} from "./_app";

interface RegisterInputs {
  image?: string;
  name: string;
  apartment: string;
  email: string;
  password: string;
  confirmPassword: string;
  isNotified: boolean;
  agreed: boolean;
}

export default withRouter(function Register() {
  const router = useRouter();
  const methods = useForm<RegisterInputs>();
  const {
    register: registerInput,
    watch,
    handleSubmit,
    setError,
    formState: { errors },
  } = methods;
  const accessToken = useReactiveVar(accessTokenVar);
  const createCommunityData = useReactiveVar(createCommunityDataVar);
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (accessToken || !createCommunityData) router.back();
    // eslint-disable-next-line
  }, [accessToken, createCommunityData]);

  const { data } = useQuery<types.FindCommunityData, types.FindCommunityVars>(
    queries.FIND_COMMUNITY,
    {
      skip: !createCommunityData?.communityCode,
      variables: { communityCode: createCommunityData?.communityCode! },
    }
  );

  const [register, { loading: mutationLoading }] = useMutation<
    types.RegisterData,
    types.RegisterVars
  >(mutations.REGISTER, {
    onCompleted({ register }) {
      accessTokenVar(register.auth.accessToken);
      refreshTokenVar(register.auth.refreshToken);
      tokenPayloadVar(jwtDecode(register.auth.accessToken));
      localStorage.setItem(
        "@sharinghood:accessToken",
        register.auth.accessToken
      );
      localStorage.setItem(
        "@sharinghood:refreshToken",
        register.auth.refreshToken
      );
      router.push("/communities");
    },
    onError({ graphQLErrors }) {
      handlerInputError<RegisterInputs>(graphQLErrors, setError);
    },
  });

  return (
    <div className="community-exists-control">
      {!createCommunityData?.isCreator && (
        <>
          <p className="main-p">Lucky you, your community already exists!</p>
          <p className="main-p">This is your community</p>
          <h1>{createCommunityData?.communityName}</h1>
          <div className="community-members">
            {data?.findCommunity.members.map((member) => (
              <div key={member.id}>
                <div className="member-img">
                  <Image
                    alt="profile pic"
                    src={
                      member.imageUrl
                        ? transformImgUrl(member.imageUrl, 200)
                        : "/profile-img.png"
                    }
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="main-p mid">How would you like to be called?</p>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit((data) => {
            if (Object.keys(errors).length === 0) {
              register({
                variables: {
                  userInput: {
                    name: data.name,
                    email: data.email.toLowerCase(),
                    password: data.password,
                    image,
                    apartment: data.apartment,
                    isNotified: data.isNotified,
                    // isCreator: createCommunityData!.isCreator,
                    communityId: createCommunityData!.communityId,
                  },
                  ...(createCommunityData!.isCreator && {
                    communityInput: {
                      name: createCommunityData!.communityName,
                      code: createCommunityData!.communityCode!,
                      zipCode: createCommunityData!.communityZipCode,
                    },
                  }),
                },
              });
            }
          })}
        >
          <input
            type="text"
            className="main-input"
            placeholder="Name"
            {...registerInput("name", {
              required: "Please enter your name",
            })}
          />
          {errors.name && <InlineError text={errors.name.message!} />}
          <p className="main-p small">
            Pictures increase trust by 80% Feel free to make your profile more
            trustworthy by uploading a picture.
          </p>
          <ImageInput type="user" image={image} setImage={setImage} />
          <p className="main-p mid">Where can the neighbours find you?</p>
          <input
            type="text"
            className="main-input"
            placeholder="Floor or house number"
            {...registerInput("apartment", {
              required: "Please enter your floor or house number",
            })}
          />
          {errors.apartment && <InlineError text={errors.apartment.message!} />}
          <p className="main-p mid">Now, please create your login account</p>
          <div className="login-control">
            <p>Already have an account?</p>
            <button className="login-btn" onClick={() => router.push("/login")}>
              Login
            </button>
          </div>
          <input
            className="main-input"
            placeholder="Email"
            {...registerInput("email", {
              required: "Please enter your email address",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email address is invalid",
              },
            })}
          />
          {errors.email && <InlineError text={errors.email.message!} />}
          {/* {error.emailExists && <InlineError text={error.emailExists} />} */}
          <input
            type="password"
            className="main-input"
            placeholder="Password"
            {...registerInput("password", {
              required: "Please enter your password",
              minLength: {
                value: 7,
                message: "Your password must be longer than 7 characters",
              },
            })}
          />
          {errors.password && <InlineError text={errors.password.message!} />}
          <input
            type="password"
            className="main-input"
            placeholder="Confirm Password"
            {...registerInput("confirmPassword", {
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <InlineError text={errors.confirmPassword.message!} />
          )}
          <div className="main-checkbox">
            <input
              type="checkbox"
              defaultChecked
              {...registerInput("isNotified")}
            />
            <p>
              I want to get notified when my neighbours request and share items
            </p>
          </div>
          <div className="main-checkbox">
            <input
              type="checkbox"
              {...registerInput("agreed", {
                validate: {
                  checked: (value) =>
                    value !== false ||
                    "Please agree to the terms and conditions",
                },
              })}
            />
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
          {errors.agreed && <InlineError text={errors.agreed.message!} />}
          <button className="main-btn" type="submit">
            {mutationLoading ? <Loader /> : "Register"}
          </button>
        </form>
      </FormProvider>
      <Modal
        className="react-modal terms"
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <SVG
          className="terms-times-icon"
          icon="times"
          onClick={() => setIsModalOpen(false)}
        />
        <Terms />
      </Modal>
      <style jsx>
        {`
          @import "./index.scss";

          .community-exists-control {
            margin: auto;
            padding-bottom: 20px;

            h1 {
              margin: 20px 0;
              color: $orange;
              max-width: 300px;
            }

            .login-control {
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
              font-size: 17px;

              .login-btn {
                border: none;
                color: $orange;
                text-align: center;
                background: $background;
                text-decoration: underline;
                font-weight: bold;

                &:hover {
                  cursor: pointer;
                }
              }
            }

            .main-btn {
              margin: 30px auto 15px auto;
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

            .community-members {
              max-width: 260px;
              overflow-x: scroll;
              display: flex;

              .member-img {
                margin: 0 5px 0 0;
                height: 60px;
                width: 60px;
                border-radius: 50%;
                position: relative;
                overflow: hidden;
              }
            }
          }
        `}
      </style>
      <style jsx global>
        {`
          @import "./index.scss";

          .terms-times-icon {
            position: -webkit-sticky;
            position: sticky;
            width: 14px;
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
});
