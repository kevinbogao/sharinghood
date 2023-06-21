import type { IHandlerResponse, INextApiRequest } from "../http/types";
import { compactObject } from "../utils/object";
import { Logger } from "./Logger";
import type { IRequestContext } from "./types";

export class ApiLogger extends Logger {
  private _getRequestContext({ query, body, ctx }: INextApiRequest): IRequestContext {
    if (!ctx.user) {
      return compactObject({ query, body }) as IRequestContext;
    }

    const { userId, discordId, ethAddress } = ctx.user;
    return compactObject({ query, body, user: { userId, discordId, ethAddress } }) as IRequestContext;
  }

  public logRequest(req: INextApiRequest, { body: resBody, status }: IHandlerResponse): void {
    const context = { request: this._getRequestContext(req), response: { status, body: resBody } };
    this.info(`(${status})`, context);
  }

  public logRequestErrors(req: INextApiRequest, errors: any): void {
    const context = { request: this._getRequestContext(req), errors };
    this.warn(`(${errors[0].status})`, context);
  }

  public logInternalErrors(req: INextApiRequest, error: any): void {
    const context = { request: this._getRequestContext(req), error };
    this.error("(500)", context);
  }

  public logOperationErrors(req: INextApiRequest, error: any): void {
    const context = { request: this._getRequestContext(req), error };
    this.error("OPERATION ERROR", context);
  }
}
