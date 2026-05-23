import { z } from "zod";

export const campaignMediaSchema = z.object({
  title: z.string().min(2),
  kind: z.enum(["video", "image"]),
  src: z.string().min(1),
  alt: z.string().min(3),
  hero: z.boolean(),
  position: z.number().int().nonnegative()
});
