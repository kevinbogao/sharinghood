import type { BaseSyntheticEvent, ChangeEvent } from "react";
import { useState } from "react";
import type { z, ZodIssue, ZodObject } from "zod";

type TKey = number | string | symbol;
type TErrors<T extends TKey = TKey> = Partial<Record<T, string>>;

export type TFieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export const isCheckBoxEvent = (event: ChangeEvent<TFieldElement>): event is ChangeEvent<HTMLInputElement> =>
  event.target.type === "checkbox";

const parseZodErrors = (zodErrors: Array<ZodIssue>): TErrors =>
  zodErrors.reduce<TErrors>((acc, { path, message }) => {
    const _path = path.join(".");
    if (!acc[_path]) {
      acc[_path] = message;
    }
    return acc;
  }, {});

interface IRegisterResult<TFieldValues> {
  name: keyof TFieldValues;
  onChange: (event: ChangeEvent<TFieldElement>) => void;
  ref: (ref: TFieldElement | null) => void;
}

type THandleSubmitFn<TSchema extends ZodObject<any>> = (
  next: (data: z.TypeOf<TSchema>, event: BaseSyntheticEvent) => Promise<void> | void
) => (e: BaseSyntheticEvent) => Promise<void>;

interface IUseFormResult<TSchema extends ZodObject<any>, TFieldValues = z.infer<TSchema>> {
  register: (name: keyof TFieldValues) => IRegisterResult<TFieldValues>;
  watch: (name: keyof TFieldValues) => string | null;
  errors: Partial<Record<keyof TFieldValues, string>>;
  setError: (name: keyof TFieldValues, error: string) => void;
  handleSubmit: THandleSubmitFn<TSchema>;
  reset: () => void;
}

export const useForm = <TSchema extends ZodObject<any>, TFieldValues = z.infer<TSchema>>(
  schema: TSchema
): IUseFormResult<TSchema, TFieldValues> => {
  const refs: Partial<Record<keyof TFieldValues, TFieldElement>> = {};
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<TErrors<keyof TFieldValues>>({});
  const [formValues, setFormValues] = useState<Partial<Record<keyof TFieldValues, string | null | undefined>>>({});

  const register = (name: keyof TFieldValues): IRegisterResult<TFieldValues> => ({
    name,
    onChange: (event: ChangeEvent<TFieldElement>): void => {
      const { name: _name, value } = event.target;
      if (formValues[_name] !== undefined) {
        setFormValues((prev) => ({ ...prev, [_name]: isCheckBoxEvent(event) ? event.target.checked : value }));
      }

      if (!isSubmitted) {
        return;
      }

      const result = schema.pick({ [_name]: true }).safeParse({ [_name]: value });
      if (result.success) {
        const _errors = Object.fromEntries(Object.entries(errors).filter(([key]) => key !== _name)) as TErrors<
          keyof TFieldValues
        >;
        setErrors(_errors);
        return;
      }

      const error = parseZodErrors(result.error.errors)[_name];
      if (error && error !== errors[_name]) {
        setErrors((prev) => ({ ...prev, [_name]: error }));
      }
    },
    ref: (ref: TFieldElement | null): void => {
      if (ref) {
        refs[name] = ref;
      }
    },
  });

  const watch = (name: keyof TFieldValues): string | null => {
    const value = formValues[name];
    if (value !== undefined) {
      return value;
    }

    setFormValues((prev) => ({ ...prev, [name]: null }));
    return "";
  };

  const setError = (name: keyof TFieldValues, error: string): void => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit: THandleSubmitFn<TSchema> = (next) => async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    const val = Object.keys(refs).reduce((acc, key) => {
      const ref = refs[key];
      if (!ref) {
        return acc;
      }

      acc[key] = ref.type === "checkbox" ? ref.checked : ref.value;
      return acc;
    }, {});

    const result = schema.safeParse(val);
    if (result.success) {
      setErrors({});
      await next(val, e);
      return;
    }

    const _errors = parseZodErrors(result.error.errors);
    const [firstErrorKey] = Object.keys(_errors);
    if (firstErrorKey) {
      refs[firstErrorKey]?.focus();
    }
    setErrors(_errors);
  };

  const reset = (): void => {
    const fieldRef = Object.values(refs)[0] as TFieldElement | undefined;
    const form = fieldRef?.closest("form");
    form?.reset();
  };

  return { register, watch, errors, setError, handleSubmit, reset };
};
