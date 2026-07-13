import { z } from "zod";
import { RESERVED_SLUGS, SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from "@/lib/constants";

const slugRegex = /^[a-zA-Z0-9_-]+$/;

export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .min(1, "URL is required")
    .url("Please enter a valid URL")
    .refine(
      (url) => url.startsWith("http://") || url.startsWith("https://"),
      "URL must start with http:// or https://"
    ),
  slug: z
    .string()
    .min(SLUG_MIN_LENGTH, `Slug must be at least ${SLUG_MIN_LENGTH} characters`)
    .max(SLUG_MAX_LENGTH, `Slug must be at most ${SLUG_MAX_LENGTH} characters`)
    .regex(slugRegex, "Slug can only contain letters, numbers, hyphens, and underscores")
    .refine(
      (slug) => !RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number]),
      "This slug is reserved"
    )
    .optional()
    .or(z.literal("")),
  title: z.string().max(100, "Title must be at most 100 characters").optional(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(100)
    .optional()
    .or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const updateLinkSchema = createLinkSchema.partial().extend({
  id: z.string().uuid(),
});

export const linkPasswordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type LinkPasswordInput = z.infer<typeof linkPasswordSchema>;
