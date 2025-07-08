'use client'

import Layout from "@/components/Layouts";
import axios from "axios";
import Link from "next/link";
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    },
});

export default function Products() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (productId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This product will be deleted permanently!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'red',
            cancelButtonColor: '#f4f4f4',
            confirmButtonText: 'Yes, delete it!',
            customClass: {
                cancelButton: 'my-cancel-button' 
            }
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/products?id=${productId}`);
                Toast.fire({
                    icon: "success",
                    title: "Product deleted successfully",
                });

                // Update UI by removing deleted product
                setProducts((prev) => prev.filter((p) => p._id !== productId));
            } catch (err) {
                console.error("Delete error", err);
                Toast.fire({
                    icon: "error",
                    title: "Failed to delete product",
                });
            }
        }
    };

    return (
        <Layout>
            {isLoading ? (
                <Loading size="lg" text="Loading All Product" />
            ) : (
                <>
                    <Link href="/products/new" className="bg-green-600 p-2 text-white rounded-md">
                        Add New Product
                    </Link>

                    <table className="basic mt-5 text-white">
                        <thead>
                            <tr>
                                <td>Product Name</td>
                                <td>Actions</td>
                            </tr>
                        </thead>

                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td>{product.title}</td>
                                    <td className="flex gap-2">
                                        <Link
                                            href={'/products/edit/' + product._id}
                                            className="flex bg-amber-300 text-black px-2 py-1 rounded"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="flex bg-red-600 text-white px-2 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </Layout>
    );
}
