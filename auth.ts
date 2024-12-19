import NextAuth, { NextAuthConfig } from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const config: NextAuthConfig = {
    providers: [Github({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({ 
       clientId:process.env.AUTH_GOOGLE_ID,
       clientSecret:process.env.AUTH_GOOGLE_SECRET,
       authorization:{
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
       }
     }),],
    basePath: "/api/auth",
    callbacks: {
      authorized({ request, auth }) {
        try {
          const { pathname } = request.nextUrl;
          if (pathname === "/protected-page") return !!auth;
          return true;
        } catch (err) {
          console.log(err);
        }
      },
      jwt({ token, trigger, session }) {
        // console.log(token);
        if (trigger === "update") token.name = session.user.name;
        return token;
      },
    },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);