import dotenv from "dotenv";
dotenv.config();

import Redis from "ioredis";

import { CONFIG } from "../Config";

export const subscriber = new Redis(CONFIG.DATABASE.REDIS_URI);
