"use client";
import React from 'react'
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
    onClick={async () => {
      await signOut({ callbackUrl: "/login" });
      window.location.reload(); // セッションキャッシュを完全にクリア
    }}
    className="text-sm px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
  >
    Logout
  </button>
  )
}
