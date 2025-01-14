
"use client";

import { useActionState } from "react";
import { useState } from "react";
import Link from "next/link";
import { signInCredentials } from "@/lib/actions"; 
import { LoginButton } from "@/components/button";

export default function FormLogin() {
  const [state, formAction] = useActionState(signInCredentials, null);

  // パスワード表示/非表示の状態
  const [showPassword, setShowPassword] = useState(false);

  // フォームフィールドの状態を管理
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <form action={formAction} className="space-y-6">
      {state?.message ? (
        <div
            className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100"
            role="alert"
            >
          <span className="font-medium">{state?.message}</span>
        </div>
        ) : null}
      <div>
        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
          Email
        </label>
        <input
          type="email"
          name="email"
          placeholder="john.doe@gmail.com"
          value={formValues.email}
          onChange={handleInputChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5"
        />
        <div aria-live="polite" aria-atomic="true">
          <span className="text-sm text-red-500 mt-2">{state?.error?.email}</span>
        </div>
      </div>
      <div>
        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="*********"
            value={formValues.password}
            onChange={handleInputChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <div aria-live="polite" aria-atomic="true">
          <span className="text-sm text-red-500 mt-2">{state?.error?.password}</span>
        </div>
      </div>
      <LoginButton/>
      <p className="text-sm font-light text-gray-500">
          Don&apos;t have an account yet? 
        <Link href="/register">
          <span className="font-medium pl-1 text-blue-600 hover:text-blue-700">Sign up here</span>
        </Link>
      </p>
    </form>
  );
}