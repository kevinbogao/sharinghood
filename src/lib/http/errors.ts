import type { ValidatorReasonEnum } from "../schema/enums";
import type { ResponseErrorCodeEnum } from "./enums";
import { HttpStatusCodeEnum } from "./enums";

export interface IValidationError {
  field?: string;
  reason?: ValidatorReasonEnum;
}

export interface IResponseErrorArgs {
  status: HttpStatusCodeEnum;
  code: ResponseErrorCodeEnum;
  message: string;
}

export interface IResponseError {
  status: HttpStatusCodeEnum;
  code: ResponseErrorCodeEnum;
  message: string;
  causes?: Array<IValidationError>;
}

export interface IErrorArgs {
  code: ResponseErrorCodeEnum;
}

export class ResponseError extends Error {
  private readonly _status: HttpStatusCodeEnum;
  private readonly _code: ResponseErrorCodeEnum;

  constructor({ status, code, message }: IResponseErrorArgs) {
    super(message);

    this._code = code;
    this._status = status;
  }

  public get error(): IResponseError {
    return {
      status: this._status,
      code: this._code,
      message: this.message,
    };
  }
}

export class ForbiddenError extends ResponseError {
  constructor(message: string, { code }: IErrorArgs) {
    super({
      status: HttpStatusCodeEnum.FORBIDDEN,
      code,
      message,
    });
  }
}

export class AuthenticationError extends ResponseError {
  constructor(message: string, { code }: IErrorArgs) {
    super({
      status: HttpStatusCodeEnum.UNAUTHORIZED,
      code,
      message,
    });
  }
}
