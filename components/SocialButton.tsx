"use client";

import { signIn } from "next-auth/react";
import { IoLogoGoogle } from "react-icons/io5";

export const GoogleButton = () => {
    const handleSignIn = async () => {
      try {
        await signIn("google", { redirectTo: "/dashboard" });
      } catch (error) {
        console.error("Sign-in error:", error);
      }
    };
  
    return (
      <button
        type="button"
        onClick={handleSignIn}
        className="flex items-center justify-center gap-1 py-2.5 rounded-lg uppercase text-white font-medium text-sm bg-blue-500 w-full"
      >
        <IoLogoGoogle />
        Sign In with Google
      </button>
    );
  };