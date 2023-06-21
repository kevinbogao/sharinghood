// import type { ErrorOption, FieldName, FieldValues } from "react-hook-form";

import type { IInternalApiError } from "../http/types";
// import type { ValidatorReasonEnum } from "../schema/enums";
// import { capitalise, lowerCase } from "../utils/string";

export const isServerError = (err: unknown): err is IInternalApiError =>
  Boolean(err) &&
  typeof err === "object" &&
  Boolean((err as IInternalApiError).errors) &&
  (err as IInternalApiError).errors.length > 0;

// export const mapErrorToFormField = <TFieldValues extends FieldValues>(
//   err: IInternalApiError,
//   setError: (name: FieldName<TFieldValues>, errorOption: ErrorOption) => void,
//   ...map: Array<{ field: FieldName<TFieldValues>; reasons: Array<ValidatorReasonEnum> }>
// ): void => {
//   err.errors.forEach((error) => {
//     if (!error.causes) {
//       return;
//     }

//     const causesMap: Record<string, ValidatorReasonEnum> = {};
//     error.causes.forEach(({ field, reason }) => {
//       if (field && reason) {
//         causesMap[field] = reason;
//       }
//     });

//     map.forEach(({ field, reasons }) => {
//       const reason = causesMap[field.toString()];
//       if (reason && reasons.includes(reason)) {
//         setError(field, { message: capitalise(lowerCase(reason)) });
//       }
//     });
//   });
// };
