import { NextRequest, NextResponse } from "next/server";
import { SignInSchema } from "@/lib/zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/hashFunctions";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv"; // Vercel KV
import { signIn } from "@/auth";

// Ratelimit インスタンス（Vercel KV を使用）
const ratelimit = new Ratelimit({
  redis: kv, // Vercel KV を指定
  limiter: Ratelimit.fixedWindow(5, "15 m"), // 15分間に5回まで許可
});

// Edge Runtime を設定
export const config = {
  runtime: "edge",
};

export async function POST(req: NextRequest) {
  try {
    // IP アドレスを取得
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    console.log("Client IP:", ip); // デバッグ用ログ

    // レートリミットの適用
    const { success, remaining } = await ratelimit.limit(ip);
    console.log(`Rate limit remaining for IP (${ip}):`, remaining);

    if (!success) {
      return NextResponse.json(
        { message: "Too many login attempts. Please try again after 15 minutes." },
        { status: 429 }
      );
    }

    // リクエストボディを取得
    const body = await req.json();
    const validatedFields = SignInSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: validatedFields.error.flatten().fieldErrors, message: "Invalid input data." },
        { status: 400 }
      );
    }

    const { email, password } = validatedFields.data;

    // ユーザーをデータベースから取得
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.salt || !user.password) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    // パスワードの検証
    const isPasswordValid = await verifyPassword(password, user.salt, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

      // 認証処理 `redirect: false` を追加してリダイレクトを防ぐ
      const result = await signIn("credentials", { email, password, redirect: false });

      if (!result) {
        return NextResponse.json({ message: "Login failed" }, { status: 401 });
      }

    // 認証成功
    return NextResponse.json({ message: "Login successful", redirectTo: "/dashboard" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}