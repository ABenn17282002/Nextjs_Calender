"use client";

import { useFormStatus } from "react-dom";

interface ButtonProps {
  type: "submit" | "button" | "reset";
  isPendingText: string;
  defaultText: string;
}

function FormButton({ type, isPendingText, defaultText }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type={type}
      disabled={pending}
      className="w-full text-white bg-blue-700 font-medium rounded-lg px-5 py-2.5 text-center uppercase hover:bg-blue-800"
    >
      {pending ? isPendingText : defaultText}
    </button>
  );
}

export const RegisterButton = () => {
  return (
    <FormButton
      type="submit"
      isPendingText="Registering..."
      defaultText="Register"
    />
  );
};

export const LoginButton = () => {
  return (
    <FormButton
      type="submit"
      isPendingText="Authenticating..."
      defaultText="Sing In"
    />
  );
};
