import React from 'react'
import { getUsers } from '@/lib/data'
import { format } from "date-fns";

export default  async function UserTable() {
    const users = await getUsers();
    if(!users?.length) return<h1 className='text-2xl'>No User Found</h1>
    return (
        <table className="w-full bg-white mt-3">
            <thead className="border-b border-gray-100">
                <tr>
                    <th className="py-3 px-6 text-left text-sm">Name</th>
                    <th className="py-3 px-6 text-left text-sm">Email</th>
                    <th className="py-3 px-6 text-left text-sm">Role</th>
                    <th className="py-3 px-6 text-left text-sm">Created At</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user)=>(
                <tr key={user.id}>
                    <td className="py-3 px-6">{user.name}</td>
                    <td className="py-3 px-6">{user.email}</td>
                    <td className="py-3 px-6">{user.role}</td>
                    <td className="py-3 px-6">{format(user.createdAt, "yyyy-MM-dd HH:mm:ss")}</td>
                </tr>
                ))}
            </tbody>
        </table>
    )
}
