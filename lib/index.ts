import type { GraphQLErrors } from "@apollo/client/errors";
import type { UseFormSetError } from "react-hook-form";

export function transformImgUrl(url: string, width: number): string {
  const splitUrl = url.split("upload");
  return `${splitUrl[0]}upload/w_${width},c_scale,f_auto${splitUrl[1]}`;
}

export function handlerInputError<T>(
  errors: GraphQLErrors,
  setError: UseFormSetError<T>
): void {
  errors.forEach((error) => {
    if (error.extensions.code === "BAD_USER_INPUT") {
      setError(error.extensions.field, {
        message: error.message,
      });
    }
  });
}
