import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
    const session = await auth();
  return (
    <nav className="bg-white border-gray-200 border-b">
    <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        <Link href="/">
            <Image src="/logo.png" alt="logo" width={128} height={39} priority />
        </Link>

    <div className="flex items-center gap-3">
        <ul className="hidden md:flex items-center gap-4 mr-5 font-semibold text-gray-600 hover:text-gray-800">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/product">Product</Link></li>
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/user">Users</Link></li>
        </ul>

        {session?.user ? (
            <div className="flex gap-3 items-center">
              <div className="flex flex-col justify-center space-y-1">
                <span className="font-semibold text-gray-600 text-right capitalize">
                  {session.user.name}
                </span>
                <span className="font-xs text-gray-400 text-right capitalize">
                  {session.user.role}
                </span>
              </div>

              <Image
                src={session.user.image || "/default-avatar.png"}
                alt="avatar"
                width={64}
                height={64}
                className="w-8 h-8 rounded-full"
              />

              {/* サインイン時のみ表示 */}
              <LogoutButton />
            </div>
          ) : (
            <Link href="/login" className="text-sm px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Login
            </Link>
          )}
      </div>
    </div>
  </nav>
  )
}
