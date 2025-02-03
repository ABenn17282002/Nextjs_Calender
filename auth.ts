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
          select: { id: true, name: true, email: true, password: true, salt: true, role: true }, 
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
        console.log("Authorize - User found:", user);

        return { id: user.id, name: user.name, email: user.email, role: user.role }; 
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if(user) token.role = user.role
      console.log(token)
      return token
    },
    
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email ?? ""; 
        session.user.role = token.role as string | undefined;
      }
    
      console.log("Session Callback - After:", session);
      return session;
    },
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
