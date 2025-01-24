import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // カスタムフィールド
      name?: string | null;
      email?: string | null;
    } & DefaultSession["user"];
  }

  interface JWT {
    id: string; // カスタムフィールド
    email?: string | null;
  }
}
