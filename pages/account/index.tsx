import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@apollo/client";
import { types } from "../../lib/types";
import { queries, mutations } from "../../lib/gql";
import { Container, Loader, InlineError } from "../../components/Container";
import ImageInput from "../../components/ImageInput";
import AccountPosts from "../../components/AccountPosts";

interface UserInputs {
  name: string;
  apartment: string;
  isNotified: boolean;
}

export default function Account() {
  const router = useRouter();
  const methods = useForm<UserInputs>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;
  const [image, setImage] = useState<string | undefined>();
  const {
    loading,
    data: userData,
    error,
  } = useQuery<types.UserData, void>(queries.GET_USER, {
    onCompleted({ user }) {
      setImage(user.imageUrl);
    },
  });

  const [updateUser, { loading: mutationLoading }] = useMutation<
    types.UpdateUserData,
    types.UpdateUserVars
  >(mutations.UPDATE_USER, {
    update(cache, { data }) {
      if (data?.updateUser) {
        const userCache = cache.readQuery<types.UserData, void>({
          query: queries.GET_USER,
        });

        if (userCache) {
          cache.writeQuery<types.UserData, void>({
            query: queries.GET_USER,
            data: {
              ...userCache,
              user: { ...userCache.user, ...data.updateUser },
            },
          });
        }
      }
      router.push("/posts");
    },
  });

  return (
    <Container loading={loading} error={error}>
      <div className="profile-control">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit((data) => {
              const user = userData?.user;
              if (
                user?.name === data.name &&
                user?.imageUrl === image &&
                user?.apartment === data.apartment &&
                user?.isNotified === data.isNotified
              )
                router.push("/posts");
              else {
                if (Object.keys(errors).length === 0) {
                  updateUser({
                    variables: {
                      userInput: {
                        ...(user?.name !== data.name && { name: data.name }),
                        ...(image && user?.imageUrl !== image && { image }),
                        ...(user?.apartment !== data.apartment && {
                          apartment: data.apartment,
                        }),
                        ...(user?.isNotified !== data.isNotified && {
                          isNotified: data.isNotified,
                        }),
                      },
                    },
                  });
                }
              }
            })}
          >
            <h2>Your profile</h2>
            <ImageInput type="user" image={image} setImage={setImage} />
            <p className="profile-pic-p">
              Pictures increase trust by 80%. Feel free to make your profile
              more trustworthy by uploading a picture.
            </p>
            {userData && userData?.user.posts.length > 0 && (
              <AccountPosts posts={userData.user.posts} router={router} />
            )}
            <p className="main-p">Your name</p>
            <input
              className="main-input"
              defaultValue={userData?.user.name}
              {...register("name", { required: "User name cannot be empty" })}
            />
            {errors.name && <InlineError text={errors.name.message!} />}
            <p className="main-p">Email address</p>
            <input
              className="main-input"
              defaultValue={userData?.user.email}
              disabled
            />
            <p className="main-p">Where can the neighbours find you?</p>
            <input
              className="main-input"
              defaultValue={userData?.user.apartment}
              {...register("apartment", {
                required: "Apartment cannot be empty",
              })}
            />
            {errors.apartment && (
              <InlineError text={errors.apartment.message!} />
            )}
            <div className="notifications-toggle">
              <p className="email-toggle-text">Receive notifications</p>
              <label className="switch">
                <input
                  type="checkbox"
                  defaultChecked={userData?.user.isNotified}
                  {...register("isNotified")}
                />
                <span className="slider"></span>
              </label>
            </div>
            <button className="main-btn block" type="submit">
              {mutationLoading ? <Loader /> : "Save"}
            </button>
          </form>
        </FormProvider>
        <style jsx>
          {`
            @import "../index.scss";

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
    </Container>
  );
}
