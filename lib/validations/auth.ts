import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    college: z.string().optional(),
    graduationYear: z.coerce.number().int().min(2020).max(2035).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2),
  college: z.string().optional(),
  graduationYear: z.coerce.number().int().min(2020).max(2035).optional(),
});

export const onboardingSchema = z.object({
  companyIds: z.array(z.string()).min(1, "Select at least one company"),
  topicIds: z.array(z.string()).min(1, "Select at least one topic"),
  skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
});
