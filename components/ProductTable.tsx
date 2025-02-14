import React from 'react'
import { getProductByUser } from '@/lib/data'
import { format } from "date-fns";

export default  async function ProductTable() {
    const products = await getProductByUser();
    if(!products?.length) return<h1 className='text-2xl'>No product Found</h1>
    return (
        <table className="w-full bg-white mt-3">
            <thead className="border-b border-gray-100">
                <tr>
                    <th className="py-3 px-6 text-left text-sm">Product Name</th>
                    <th className="py-3 px-6 text-left text-sm">Price</th>
                    <th className="py-3 px-6 text-left text-sm">Created At</th>
                    <th className="py-3 px-6 text-left text-sm">Created By</th>
                </tr>
            </thead>
            <tbody>
                {products.map((product)=>(
                <tr key={product.id}>
                    <td className="py-3 px-6">{product.name}</td>
                    <td className="py-3 px-6">{product.price}</td>
                    <td className="py-3 px-6">{format(product.createdAt, "yyyy-MM-dd HH:mm:ss")}</td>
                    <td className="py-3 px-6">{product.user.name}</td>
                </tr>
                ))}
            </tbody>
        </table>
    )
}