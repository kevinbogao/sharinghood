import { format } from "date-fns";

import { appConfig } from "../client/appConfig";

export const formatDate = (value: Date): string => format(new Date(value), appConfig.format.date);
