import { object, string } from "zod";

export const RegisterSchema = object({
  name: string().min(1, "Name must be more than 1 Character"),
  email: string().email("Invalid Email"),
  password: string()
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters")
    .regex(
     /^(?=.*[A-Za-z])(?=.*\d)(?=.*[.,:;!?'"()[\]{}+\-*/%=<>@#$^&*()_~`])[A-Za-z\d.,:;!?'"()[\]{}+\-*/%=<>@#$^&*()_~`]+$/,
      "Password must include at least one letter, one number, and one special character"
    ),
  ConfirmPassword: string()
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
}).refine((data) => data.password === data.ConfirmPassword, {
  message: "Password does not match",
  path: ["ConfirmPassword"],
});
