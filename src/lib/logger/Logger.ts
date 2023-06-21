import type { Logtail } from "@logtail/browser";

import { CONFIG, RuntimeEnvironmentEnum } from "../Config";
import { LogColorEnum, LogLevelEnum } from "./enums";
import { logtail } from "./logtail";

const ESCAPE_CHARACTER = "\x1b[0m";

type TMessage = number | string;

export class Logger {
  private readonly _prefix: string;
  private readonly _logtail: Logtail | undefined;
  private readonly _config: Record<LogLevelEnum, { color: string }> = {
    info: { color: LogColorEnum.FG_GREEN },
    warn: { color: LogColorEnum.FG_WARN },
    error: { color: LogColorEnum.FG_ERROR },
  };

  constructor(prefix: string, logtailInstance?: Logtail) {
    this._prefix = prefix;
    this._logtail = logtailInstance;
  }

  /**
   * Creates log prefix and append to message, map different colours to console methods
   * Log to logtail if run time environment is not local
   * @private
   */
  private _log(level: LogLevelEnum, message: TMessage, context?: any): void {
    const { color } = this._config[level];
    const timeStamp = new Date().toLocaleTimeString();
    const logPrefix = `${level.toUpperCase()} | ${timeStamp} | [${CONFIG.SERVER.RUNTIME_ENVIRONMENT.toUpperCase()}] -> ${
      this._prefix
    }`;

    // eslint-disable-next-line no-console
    console[level](`${color}%s${ESCAPE_CHARACTER}`, `${logPrefix} -> ${message}`);

    if (context) {
      // eslint-disable-next-line no-console
      console[level](`${color}%s${ESCAPE_CHARACTER}`, JSON.stringify(context, null, 4));
    }

    if (this._logtail && CONFIG.SERVER.RUNTIME_ENVIRONMENT !== RuntimeEnvironmentEnum.LOCAL) {
      void this._logtail[level](`${this._prefix} -> ${message}`, context);
      void this._logtail.flush();
    }
  }

  public info = (message: TMessage, context?: any): void => this._log(LogLevelEnum.INFO, message, context);
  public warn = (message: TMessage, context?: any): void => this._log(LogLevelEnum.WARN, message, context);
  public error = (message: TMessage, context?: any): void => this._log(LogLevelEnum.ERROR, message, context);
}

export const listenerLogger = new Logger("[LISTENER]", logtail);
