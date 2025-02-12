import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
};

const ProductPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-screen-md mx-auto py-10">
        <h1 className="text-2xl font-bold">Products List</h1>
      </div>
    </div>
  );
};

export default ProductPage;
