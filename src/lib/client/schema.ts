import { coerce } from "zod";

export const routerIdSchema = coerce.string().cuid2();
