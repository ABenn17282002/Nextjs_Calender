import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string; // カスタムフィールド
    role?: string; 
  }

  interface Session {
    user: User & DefaultSession["user"]; // 拡張した User 型を適用
    role?: string; 
  }

  interface JWT {
    id: string; // カスタムフィールド
    email?: string | null;
    role?: string; 
  }
}
