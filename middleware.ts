export { auth as middleware } from "@/auth";

export const config = {
    matcher: [
        "/((?!api/auth|api|_next/static|_next/image|favicon.ico).*)", // `/api/auth` ルートを除外
    ],
};