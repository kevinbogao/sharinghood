import { useEffect, useState } from "react";
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
  const accessToken = useReactiveVar(accessTokenVar);
  const [isCreate, setIsCreate] = useState(false);

  useEffect(() => {
    if (accessToken) router.push("/posts");
  }, [router, accessToken]);

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

  return (
    <div className="home-control">
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
          <button
            type="button"
            className="main-btn create"
            onClick={() => router.push("/communities/create")}
          >
            Create Community
          </button>
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
      <style jsx>
        {`
          @import "./index.scss";

          .home-control {
            display: flex;
            margin: auto;
            align-items: center;
            justify-content: space-evenly;
            width: 60vw;
            flex-direction: row;

            @include xl {
              width: 80vw;
            }

            @include lg {
              flex-direction: column;
            }

            .home-intro {
              flex: 1;
              text-align: center;

              @include lg {
                flex: initial;
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

              .main-btn {
                margin-top: 20px;
                width: 240px;

                &.create {
                  margin-top: 94px;
                }
              }

              .main-input {
                width: 220px;
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
            }
          }
        `}
      </style>
    </div>
  );
}

Modal.setAppElement("#__next");
