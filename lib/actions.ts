"use server";

import { RegisterSchema } from "@/lib/zod"; // バリデーションスキーマ
import { prisma } from "@/lib/prisma"; // Prisma クライアント
import { redirect } from "next/navigation"; // ページ遷移用
import { hashPassword } from "@/lib/hashFunctions"; // ハッシュ関数

// ユーザー登録のアクション
export const signUpCredentials = async (
  prevState: unknown,
  formData: FormData
) => {
  // Zod スキーマで検証
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
    // データベースにユーザーを作成
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

  // 登録後にログインページへリダイレクト
  redirect("/login");
};

// ログインのアクション
export const signInCredentials = async (formData: FormData) => {
  try {
    // 環境変数からベース URL を取得
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      throw new Error("BASE URL is not defined in environment variables");
    }

    // 絶対 URL を使用して API リクエストを送信
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error, message: result.message };
    }

    return result;
  } catch (error) {
    console.error("Login error:", error);
    return { message: "Something went wrong. Please try again later." };
  }
};


