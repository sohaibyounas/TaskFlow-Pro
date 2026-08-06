import { z } from "zod";

export const profileFormSchema = z.object({
  username: z.string().min(3, "Username should be atleast 3 character").max(50),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const passwordFormSchema = z
  .object({
    newPassword: z.string().min(6, "Password  should be atleast 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords match nahi ho rahe",
    path: ["confirmPassword"],
  });

export type PasswordFormValues = z.infer<typeof passwordFormSchema>;
