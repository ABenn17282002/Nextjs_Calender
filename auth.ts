import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import Credentials from "next-auth/providers/credentials";
import { SignInSchema } from "./lib/zod";
import { verifyPassword } from "@/lib/hashFunctions"; // 検証関数
import { NextResponse } from "next/server";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages:{
    signIn:"/login",
  },
  providers: [
    Github({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          code_challenge_method: "S256",
        },
      },
    }),
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
    async signIn({ user, account }) {
      // OAuth プロバイダーの場合（Google, GitHub, Twitter, Facebookなど）
      if (account?.provider && account.provider !== "credentials") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true }, // 既存のアカウント情報も取得
        });
    
        if (existingUser) {
          // 既存のユーザーがいるが、OAuth アカウントが未リンクの場合
          const accountExists = existingUser.accounts.some(acc => acc.provider === account.provider);
    
          if (!accountExists) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                type: account.type,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
              },
            });
          }
        } else {
          // 初めてのユーザーなので新規作成
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              salt: null, // OAuth は salt 不要
              password: null, // OAuth は password も不要
              accounts: {
                create: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  type: account.type,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                },
              },
            },
          });
        }
      }
      return true;
    },
    

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
        session.user.role = token.role as string | "";
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
