'use client'
import Layout from "@/components/Layouts";
import ProductForm from "@/components/ProductForm";
import { useRouter } from "next/navigation";

export default function NewProduct() {

    const router = useRouter()
     const handleBack = () => {
        router.back();
    };

    return (
        <Layout>
            <div className="mb-10 flex gap-x-5 items-center text-white">
                <button
                    onClick={handleBack}
                    className="p-2 flex justify-center items-center bg-[#0a0a0a] rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    back
                </button>
                <h2 className="font-semibold text-xl">Add New Product</h2>
            </div>
            <ProductForm />
        </Layout>
    )
}