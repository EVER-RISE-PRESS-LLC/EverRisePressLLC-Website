import { z } from "zod";

export const referralPartnerSchema = z.object({
  name: z.string().trim().min(2, "Enter a partner name with at least 2 characters.").max(150, "Keep the partner name under 150 characters."),
  slug: z.string().trim().toLowerCase().min(1, "Enter a short name for the referral link.").max(100, "Keep the link name under 100 characters.").regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use letters, numbers, and single hyphens, such as growth-mindset."),
  contactEmail: z.string().trim().toLowerCase().max(254, "Keep the email address under 254 characters.").email("Enter a valid email address, such as host@podcast.com."),
  customUtm: z.string().trim().max(200, "Keep the internal label under 200 characters.").optional(),
});

export const referralPartnerPatchSchema = referralPartnerSchema.partial().extend({ isActive: z.boolean().optional() });
