"use server";

import { RegisterSchema } from "@/lib/zod"; // 入力データのバリデーションスキーマ
import { hashSync } from "bcrypt-ts"; // パスワードのハッシュ化用
import { prisma } from "@/lib/prisma"; // Prisma クライアント
import { redirect } from "next/navigation"; // ページ遷移用

// サインアップ処理を行う関数
export const signUpCredentials = async (
  prevState:unknown,
  formData: FormData
) => {
  // 1. フォームデータをバリデーション
  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  // 1.1 バリデーションが失敗した場合、エラーメッセージを返す
  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. バリデーションに成功した場合、データを取得
  const { name, email, password } = validatedFields.data;

  // 3. パスワードをハッシュ化
  const hashedPassword = hashSync(password, 10);

  try {
    // 4. データベースに新規ユーザーを作成
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

  } catch (error)  {
    // 5. エラーが発生した場合、エラーメッセージを返す
    void error;
    return { message: "Failed to register user" };
  }
    // 6.ユーザー作成後、別のページにリダイレクト
    redirect("/login");
};
