import type { GetServerSideProps, NextPage } from "next";
import { useState } from "react";

import { Button } from "../../components/Button";
import { Checkbox } from "../../components/Checkbox";
import { ImageInput, ImageInputTypeEnum } from "../../components/ImageInput";
import { Input } from "../../components/Input";
import { useMeQuery, useUpdateMeMutation } from "../../hooks/api/UsersHooks";
import { useForm } from "../../hooks/useForm";
import { apiRequestSSR } from "../../lib/client/apiRequest";
import { appConfig } from "../../lib/client/appConfig";
import { ToastTypeEnum } from "../../lib/client/enums";
import { queryClient } from "../../lib/client/queryClient";
import { QueryKeys } from "../../lib/client/QueryKeys";
import { useToastStore } from "../../lib/client/Store";
import { updateMeBodySchema } from "../../lib/schema/users";
import type { TMeResponse } from "../api/users/me";

interface IMeResponse {
  me: TMeResponse | null;
}

export const getServerSideProps: GetServerSideProps<IMeResponse> = async ({ req }) => {
  const me = await apiRequestSSR<TMeResponse>(req, "/users/me");
  return { props: { me } };
};

const Account: NextPage<IMeResponse> = ({ me }) => {
  const [image, setImage] = useState<string | undefined>();
  const { register, handleSubmit, errors } = useForm(updateMeBodySchema.omit({ image: true }));
  const addToast = useToastStore((state) => state.addToast);

  const { data } = useMeQuery({ ...(me && { initialData: me }) });
  const { isLoading, mutate } = useUpdateMeMutation({
    onSuccess: ({ me: _me }) => {
      const queryKeys = QueryKeys.Users.me;
      queryClient.setQueryData<TMeResponse>(queryKeys, () => ({ me: _me }));
      addToast({ type: ToastTypeEnum.SUCCESS, message: "Your profile has been updated successfully!" });
    },
  });

  return (
    <div className="m-auto">
      <form className="w-64" onSubmit={handleSubmit((form) => mutate({ ...form, ...(image && { image }) }))}>
        <p className="mb-2 text-lg font-medium">Your profile</p>
        <ImageInput
          image={image ?? data?.me.image_url ?? appConfig.imagePlaceholderPath.profile}
          setImage={setImage}
          type={ImageInputTypeEnum.PROFILE}
        />
        <p className="-mt-5 mb-4 text-xs">
          Pictures increase trust by 80%. Feel free to make your profile more trustworthy by uploading a picture.
        </p>
        <Input {...register("name")} defaultValue={data?.me.name} errText={errors.name} />
        <Input
          {...register("description")}
          defaultValue={data?.me.description ?? ""}
          errText={errors.description}
          placeholder="Description"
        />
        <Input defaultValue={data?.me.email} disabled />
        <Input
          {...register("apartment")}
          defaultValue={data?.me.apartment ?? ""}
          errText={errors.apartment}
          placeholder="Apartment Nr."
        />
        <Checkbox
          defaultChecked={Boolean(data?.me.is_notified)}
          label="Receive email notifications"
          {...register("is_notified")}
        />
        <Button isLoading={isLoading} type="submit">
          Save
        </Button>
      </form>
    </div>
  );
};

export default Account;
