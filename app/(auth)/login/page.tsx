import FormLogin from '@/components/auth/FormLogin';
import React from 'react';

export default function Login() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Sign In to your account</h1>
      <FormLogin/>
    </div>
  );
}
