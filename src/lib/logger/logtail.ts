import dotenv from "dotenv";
dotenv.config();

import { Logtail } from "@logtail/browser";

import { CONFIG } from "../Config";

export const logtail = new Logtail(CONFIG.SERVER.LOGTAIL_SOURCE_TOKEN);
