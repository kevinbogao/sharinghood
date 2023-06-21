import { object } from "zod";

import { cuidSchema } from ".";

export const adminStatsQuery = object({ id: cuidSchema });
