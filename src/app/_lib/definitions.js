import { z } from "zod";

export const signupFormSchema = z.object({
  fname: z.string().min(2, { message: "Name must be at least 2 characters long." }),
  lname: z.string().min(2, { message: "Last Name must be at least 2 characters long." }),
  pword: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter" })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, { message: "Contain at least one special character" }),
});

export const signinSchema = z.object({
  fname: z.string().min(2, { message: "Name must be at least 2 characters long." }),
  pword: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter" })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, { message: "Contain at least one special character" }),
});
