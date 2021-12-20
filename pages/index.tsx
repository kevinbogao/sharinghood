import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useLazyQuery, useReactiveVar } from "@apollo/client";
import Modal from "react-modal";
import { types } from "../lib/types";
import { queries } from "../lib/gql";
import { Loader, InlineError } from "../components/Container";
import { accessTokenVar, createCommunityDataVar } from "./_app";

interface CodeInput {
  code: string;
}

export default function Home() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CodeInput>();
  const [isCreate, setIsCreate] = useState(false);
  const accessToken = useReactiveVar(accessTokenVar);
  const [community, { loading }] = useLazyQuery<
    types.FindCommunityData,
    types.FindCommunityVars
  >(queries.FIND_COMMUNITY, {
    onCompleted({ findCommunity }) {
      if (findCommunity) {
        createCommunityDataVar({
          isCreator: false,
          communityId: findCommunity.id,
          communityName: findCommunity.name,
          communityCode: findCommunity.code,
        });
        router.push("/register");
      } else {
        setError("code", { message: "Community not found" });
      }
    },
  });

  useEffect(() => {
    if (accessToken) router.push("/posts");
  }, [router, accessToken]);

  return (
    <div className="home-control">
      <div className="home-content">
        <div className="home-intro">
          <p className="main-p">Refuse. Dispose. Separate.</p>
          <p className="main-p">
            Find appreciation for your items by consuming less and sharing more.
          </p>
        </div>
        <div className="home-community">
          <div className="home-switch">
            <button
              type="button"
              className={`${isCreate && "active"}`}
              onClick={() => setIsCreate(true)}
            >
              Create Your Community
            </button>
            <div className="switch-btn-separator" />
            <button
              type="button"
              className={`${!isCreate && "active"}`}
              onClick={() => setIsCreate(false)}
            >
              Enter Community Code
            </button>
          </div>
          {isCreate ? (
            <Link href="/communities/create">
              <a>
                <button type="button" className="main-btn create">
                  Create Community
                </button>
              </a>
            </Link>
          ) : (
            <form
              onSubmit={handleSubmit((data) => {
                if (Object.keys(errors).length === 0) {
                  community({ variables: { communityCode: data.code } });
                }
              })}
            >
              <input
                className="main-input"
                placeholder="Community Code"
                {...register("code", {
                  required: "Please enter a community code",
                  pattern: {
                    value: /^[a-z0-9]+$/i,
                    message: "Please only use standard alphanumerics",
                  },
                })}
              />
              {errors.code && <InlineError home text={errors.code.message!} />}
              <button className="main-btn" type="submit">
                {loading ? <Loader /> : "Find my community"}
              </button>
            </form>
          )}
        </div>
      </div>
      <style jsx>
        {`
          @import "./index.scss";

          .home-control {
            display: flex;
            flex-direction: column;

            .main-p {
              max-width: initial;
            }

            .home-content {
              flex: 1 1 0%;
              margin: auto;
              display: flex;
              justify-content: space-between;
              align-items: center;
              overflow-y: scroll;

              @include xl {
                max-width: 80vw;
              }

              @include lg {
                flex-direction: column;
                justify-content: center;
              }

              .home-intro {
                flex: 1;
                text-align: center;

                @include lg {
                  flex: initial;
                }

                p {
                  margin: 20px auto;
                  width: 60%;

                  @include sm {
                    width: 80%;
                  }
                }

                @include lg {
                  margin-bottom: 40px;
                }
              }

              .home-community {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;

                @include lg {
                  flex: initial;
                }

                .home-switch {
                  max-width: 500px;
                  display: flex;

                  button {
                    margin: auto 20px;
                    display: block;
                    font-size: 18px;
                    background: none;
                    border-width: 0;
                    cursor: pointer;
                    color: $black;

                    &.active {
                      color: $orange;
                    }
                  }
                }

                .main-input {
                  width: 220px;
                }

                .main-btn {
                  margin-top: 20px;
                  display: block;
                  width: 240px;
                  display: flex;
                  align-items: center;
                  justify-content: center;

                  &.create {
                    margin-top: 90px;
                  }
                }
              }
            }
          }
        `}
      </style>
    </div>
  );
}

Modal.setAppElement("#__next");
