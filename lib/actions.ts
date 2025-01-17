"use server";

import { RegisterSchema, SignInSchema } from "@/lib/zod"; // バリデーションスキーマ
import { prisma } from "@/lib/prisma"; // Prisma クライアント
import { redirect } from "next/navigation"; // ページ遷移用
import { hashPassword, verifyPassword } from "@/lib/hashFunctions"; // ハッシュ関数
import { signIn } from '@/auth';
import { AuthError } from "next-auth";

// sign Up Credentials action
export const signUpCredentials = async (
  prevState: unknown,
  formData: FormData
) => {
  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;
  const salt = crypto.randomUUID(); // ランダムなソルトを生成
  const hashedPassword = await hashPassword(password, salt);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        salt,
      },
    });
  } catch (error) {
    console.error(error);
    return { message: "Failed to register user" };
  }

  redirect("/login");
};

// sign In Credentials action
export const signInCredentials = async (
  prevState: unknown,
  formData: FormData
) => {
    // フォームデータを Zod スキーマで検証
    const validatedFields = SignInSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    // ユーザーをデータベースから取得
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password || !user.salt) {
      return { message: "Invalid email or password." };
    }

    // 入力されたパスワードを検証
    const isPasswordValid = await verifyPassword(password, user.salt, user.password);

    if (!isPasswordValid) {
      return { message: "Invalid email or password." };
    }

    // サインイン成功時の処理
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

  } catch (error) {
    // エラーが AuthError の場合、適切なメッセージを返す
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Invalid Credentials." };
        default:
          return { message: "Something went wrong." };
      }
    }

    // その他のエラーは再スロー
    throw error;
  }
};
