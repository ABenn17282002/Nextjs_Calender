import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import Credentials from "next-auth/providers/credentials";
import { SignInSchema } from "./lib/zod";
import { verifyPassword } from "@/lib/hashFunctions"; // 検証関数
import { NextResponse } from "next/server";

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
    authorized({ auth, request }) {
      const nextUrl = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const ProtectedRoutes = new Set(["/dashboard", "/user", "/product"]);
  
      if (!nextUrl || !nextUrl.pathname) {
        console.error("Error: nextUrl or nextUrl.pathname is undefined", nextUrl);
        return false;
      }
  
      if (!isLoggedIn && ProtectedRoutes.has(nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/login", nextUrl.origin)); // 絶対URLを指定
      }
  
      if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl.origin)); // 絶対URLを指定
      }
  
      return true;
    },
  },
});
