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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const ProtectedRoutes = new Set(["/dashboard", "/user", "/product"]); // Set を使用
  
      if (!isLoggedIn && ProtectedRoutes.has(nextUrl.pathname)) {
        return new Response(null, { status: 302, headers: { Location: "/login" } });
      }
  
      if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
        return new Response(null, { status: 302, headers: { Location: "/dashboard" } });
      }
  
      return true;
    },
  },
});
