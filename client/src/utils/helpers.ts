import { Dispatch, SetStateAction } from "react";

export interface FormError {
  [key: string]: string;
}

interface InputElements {
  [element: string]: HTMLInputElement | null;
}

const EMPTY_INPUT_ERRORS: FormError = {
  code: "Please enter a community code",
  desc: "Please enter a description",
  name: "Please enter your name",
  image: "Please upload a picture of the item",
  title: "Please enter a title",
  email: "Please enter your email address",
  agreed: "Please agree to the terms and conditions",
  zipCode: "Please enter your zip code",
  password: "Please enter your password",
  apartment: "Please enter your floor or house number",
  loginPassword: "Please enter your password",
  communityName: "Please enter a community name",
};

function hasNonStdChars(str: string): boolean {
  return /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(str);
}

export function isValidEmail(email: string): boolean {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function validateForm(
  elements: InputElements,
  setError: Dispatch<SetStateAction<FormError>>
): FormError {
  let errors: FormError = {};
  for (const key in elements) {
    // Empty image object
    if (key === "image") {
      if (!elements[key]) errors[key] = EMPTY_INPUT_ERRORS[key];
    } else {
      // Empty input fields
      if (elements[key]!.value === "") errors[key] = EMPTY_INPUT_ERRORS[key];
      else {
        // Community code
        if (key === "code" && hasNonStdChars(elements[key]!.value)) {
          errors[key] = "Please only use standard alphanumerics";
        }

        // Email
        if (key === "email" && !isValidEmail(elements[key]!.value)) {
          errors[key] = "Email address is invalid";
        }

        // Password
        if (
          key === "password" &&
          "confirmPassword" in elements &&
          elements[key]!.value.length < 7
        ) {
          errors[key] = "Your password must be longer than 7 characters";
        }
      }

      // Confirm password
      if (
        key === "confirmPassword" &&
        elements[key]!.value !== elements.password!.value
      ) {
        errors[key] = "Passwords do not match";
      }

      // Checkbox
      if (key === "agreed" && !elements[key]!.checked) {
        errors[key] = EMPTY_INPUT_ERRORS[key];
      }
    }
  }
  setError(errors);
  return errors;
}

export function transformImgUrl(url: string, width: number): string {
  const splitUrl = url.split("upload");
  return `${splitUrl[0]}upload/w_${width},c_scale,f_auto${splitUrl[1]}`;
}

export function setErrorMsg(
  message: string,
  setError: Dispatch<SetStateAction<FormError>>
): void {
  const errMsgArr = message.split(": ");
  setError({ [errMsgArr[0]]: errMsgArr[1] });
}
