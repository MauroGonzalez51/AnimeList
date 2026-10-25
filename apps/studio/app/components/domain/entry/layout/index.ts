import { z } from "zod";

export const LayoutSchema = z.union([z.literal("grid"), z.literal("bento")]);

export type Layout = z.infer<typeof LayoutSchema>;
