"use client";

import { useState } from "react";
import { LoginButton } from "../button";

export default function FormLogin() {
  const [error, setError] = useState<string | null>(null); // エラーメッセージを格納
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false); // パスワードの表示/非表示を制御

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // エラーメッセージをリセット

    const formData = {
      email: formValues.email,
      password: formValues.password,
    };
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // JSON を送信
        },
        body: JSON.stringify(formData), // JSON に変換して送信
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Login failed. Please try again."); // エラーメッセージを設定
      } else if (result.redirectTo) {
        window.location.href = result.redirectTo; // ダッシュボードにリダイレクト
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      setError("Something went wrong. Please try again later.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev); // パスワードの表示/非表示を切り替え
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100" role="alert">
          {error}
        </div>
      )}

      {/* Email フィールド */}
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
      </div>

      {/* Password フィールド */}
      <div>
        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"} // パスワードの表示/非表示を切り替え
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
      </div>

      <LoginButton/>
    </form>
  );
}
