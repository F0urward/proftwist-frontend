import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Никнейм должен содержать хотя бы 3 символа")
      .max(20, "Никнейм максимально может содержать 20 символов")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Никнейм может содержать только латинские буквы, цифры и нижнее подчеркивание",
      )
      .nonempty("Введите никнейм"),
    email: z.email("Некорректный адрес почты").nonempty("Введите адрес почты"),
    password: z
      .string()
      .min(8, "Пароль должен содержать хотя бы 8 символов")
      .regex(/.*\d.*/, "Пароль должен содержать хотя бы одну цифру")
      .nonempty("Введите пароль"),
    passwordRepeat: z.string().nonempty("Пожалуйста, повторите пароль"),
  })
  .refine((data) => data.password === data.passwordRepeat, {
    message: "Пароли должны совпадать",
    path: ["passwordRepeat"], // Attach error to passwordRepeat field
  });

export type SignupFormData = z.infer<typeof registerSchema>;

export const profileSchema = z
  .object({
    username: z
      .string()
      .min(3, "Никнейм должен содержать хотя бы 3 символа")
      .max(20, "Максимум 20 символов")
      .regex(/^[a-zA-Z0-9_]+$/, "Можно использовать только буквы, цифры и _")
      .nonempty("Введите никнейм"),

    email: z
      .string()
      .email("Некорректный адрес почты")
      .nonempty("Введите адрес почты"),

    password: z
      .string()
      .min(8, "Пароль должен содержать хотя бы 8 символов")
      .regex(/.*\d.*/, "Пароль должен содержать хотя бы одну цифру")
      .optional()
      .or(z.literal("")),

    passwordRepeat: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.password && data.password !== "") {
        return data.password === data.passwordRepeat;
      }
      return true;
    },
    {
      message: "Пароли должны совпадать",
      path: ["passwordRepeat"],
    },
  );

export type ProfileFormData = z.infer<typeof profileSchema>;
