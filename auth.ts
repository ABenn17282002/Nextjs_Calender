import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import Credentials from "next-auth/providers/credentials";
import { SignInSchema } from "./lib/zod";
import { verifyPassword } from "@/lib/hashFunctions"; // 検証関数

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages:{
    signIn:"/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const validatedFields = SignInSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password || !user.salt) {
          throw new Error("No user found");
        }

        const isPasswordValid = await verifyPassword(
          password,
          user.salt,
          user.password
        );

        if (!isPasswordValid) return null;

        return { id: user.id, name: user.name, email: user.email }; 
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT Token before:", token);
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      console.log("JWT Token after:", token);
      return token;
    },
        // セッションデータをカスタマイズ
        async session({ session, token }) {
          console.log("Session before:", session);
          if (token) {
            session.user.id = token.id as string; // 型を明示的にキャスト
            session.user.email = token.email ?? ""; // nullやundefinedを考慮
          }
          console.log("Session after:", session);
          return session;
        },
  }
});
