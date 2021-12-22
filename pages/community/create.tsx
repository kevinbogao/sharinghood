import { useRouter } from "next/router";
import { useMutation, useLazyQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import { types } from "../../lib/types";
import { queries, mutations } from "../../lib/gql";
import { Loader, InlineError } from "../../components/Container";
import {
  communityIdVar,
  accessTokenVar,
  createCommunityDataVar,
} from "../_app";

interface CommunityInputs {
  code: string;
  zipCode: string;
  communityName: string;
}

export default function CreateCommunity() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CommunityInputs>();

  const [community, { loading }] = useLazyQuery<
    types.FindCommunityData,
    types.FindCommunityVars
  >(queries.FIND_COMMUNITY, {
    onCompleted({ findCommunity }) {
      if (findCommunity) setError("code", { message: "Community code exists" });
      else router.push("/register");
    },
  });

  const [createCommunity, { loading: mutationLoading }] = useMutation<
    types.CreateCommunityData,
    types.CreateCommunityVars
  >(mutations.CREATE_COMMUNITY, {
    onCompleted: ({ createCommunity }) => {
      localStorage.setItem("@sharinghood:communityId", createCommunity.id);
      communityIdVar(createCommunity.id);
      router.push("/posts");
    },
    // onError: ({ message }) => {
    //   const errMsgArr = message.split(": ");
    //   setErrors({ [errMsgArr[0]]: errMsgArr[1] });
    // },
  });

  return (
    <div className="create-community-control">
      <p className="main-p large">You are a hero already!</p>
      <p className="main-p small">
        Create a community now and invite your members via link later.
      </p>
      <p className="main-p mid">Give your community a name</p>
      <form
        onSubmit={handleSubmit((data) => {
          if (Object.keys(errors).length === 0) {
            createCommunityDataVar({
              isCreator: true,
              communityName: data.communityName,
              communityCode: data.code,
              communityZipCode: data.zipCode,
            });
            if (accessTokenVar())
              createCommunity({
                variables: {
                  communityInput: {
                    name: data.communityName,
                    code: data.code,
                    zipCode: data.zipCode,
                  },
                },
              });
            else community({ variables: { communityCode: data.code } });
          }
        })}
      >
        <input
          className="main-input"
          placeholder="Community Name"
          {...register("communityName", {
            required: "Please enter a community name",
          })}
        />
        {errors.communityName && (
          <InlineError home text={errors.communityName.message!} />
        )}
        <p className="main-p mid">Create a unique code for your community</p>
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
        <p className="main-p mid">Please enter your zip code</p>
        <input
          className="main-input"
          placeholder="Zip code"
          {...register("zipCode", { required: "Please enter your zip code" })}
        />
        {errors.zipCode && <InlineError text={errors.zipCode.message!} />}
        <button className="main-btn" type="submit">
          {loading || mutationLoading ? <Loader /> : "Next"}
        </button>
      </form>
      <style jsx>
        {`
          @import "../index.scss";

          .create-community-control {
            margin: auto;

            @include sm {
              max-width: 300px;
              width: 80vw;
            }

            .main-input {
              margin: 10px 0 0 0;
            }

            .large {
              font-size: 22px;
            }

            .mid {
              margin-top: 20px;
            }

            .main-btn {
              margin-top: 35px;
            }
          }
        `}
      </style>
    </div>
  );
}
