"use client"; // クライアントコンポーネントとして定義

import React from "react";
import { Button } from "./ui/button";
import { signIn, signOut } from "next-auth/react";

export function SignIn({
  provider,
  ...props
}: { provider?: string }) {
  return (
    <Button
      onClick={() => {
        signIn(provider);
      }}
      {...props}
    >
      サインイン
    </Button>
  );
}

export function SignOut({ ...props }) {
  return (
    <Button
      onClick={() => {
        signOut();
      }}
      variant="ghost"
      className="w-full p-0"
      {...props}
    >
      ログアウト
    </Button>
  );
}
