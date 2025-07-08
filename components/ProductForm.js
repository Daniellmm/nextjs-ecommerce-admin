'use client'
// import Layout from "./Layouts";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import NextFileUpload from "./NextFileUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "@/components/ui/switch"

export default function ProductForm({
    _id,
    title: existingTitle,
    description: existingDescription,
    price: existingPrice,
    images: existingImages,
    category: existingCategory,
    properties: assignedProperties,
    discount: existingDiscount,
    percentage: existingPercentage,
    topSelling: existingTopSelling,
}) {

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

    const router = useRouter();
    const [title, setTitle] = useState(existingTitle || '')
    const [description, setDescription] = useState(existingDescription || '')
    const [price, setPrice] = useState(existingPrice || '')
    const [images, setImages] = useState(existingImages || []);
    const [category, setCategory] = useState(existingCategory || '')
    const [goToProducts, setGoToProducts] = useState(false)
    const [categories, setCategories] = useState([])
    const [productProperties, setProductProperties] = useState(assignedProperties || {})
    const [discount, setDiscount] = useState(existingDiscount || '');
    const [percentage, setPercentage] = useState(existingPercentage || '');
    const [topSelling, setTopSelling] = useState(existingTopSelling || false);


    useEffect(() => {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        })
    }, [])


    // Update images when existingImages changes (useful for edit mode)
    useEffect(() => {
        if (existingImages) {
            setImages(existingImages);
        }
    }, [existingImages]);

    const handleBack = () => {
        router.back();
    };

    // This function will be called whenever images change in NextFileUpload
    const handleImageUpload = useCallback((urls) => {
        setImages(urls);
    }, []);

    async function saveProduct(ev) {
        ev.preventDefault();
        const data = {
            title, price, description, images, category,
            properties: productProperties, discount,                  // Add this
            percentage, topSelling,
        };

        if (_id) {
            // Update product
            try {
                await axios.put('/api/products', { ...data, _id });

                Toast.fire({
                    icon: "success",
                    title: "Product updated successfully"
                });
            } catch (error) {
                console.error('Error updating product:', error);
                Toast.fire({
                    icon: "error",
                    title: "Failed to update product"
                });
            }
        } else {
            // Create product
            try {
                await axios.post('/api/products', data);

                Toast.fire({
                    icon: "success",
                    title: "Product Added successfully"
                });

                // Reset form after successful creation
                setTitle('');
                setDescription('');
                setPrice('');
                setImages([]);
            } catch (error) {
                console.error('Error creating product:', error);
                Toast.fire({
                    icon: "error",
                    title: "Failed to create product"
                });
            }
        }
    }


    const propertiesToFill = [];
    if (categories.length > 0 && category) {
        let catInfo = categories.find(({ _id }) => _id === category)
        propertiesToFill.push(...catInfo.properties)
        while (catInfo?.parent?._id) {
            const parentCat = categories.find(({ _id }) => _id === catInfo?.parent?._id
            )
            propertiesToFill.push(...parentCat.properties);

            catInfo = parentCat;
        }
    }


    function setProductProp(propName, value) {
        setProductProperties(prev => {
            const newProductProps = { ...prev }
            newProductProps[propName] = value
            return newProductProps
        })
    }


    useEffect(() => {
        if (price && discount && Number(price) > 0) {
            const perc = (((Number(price) - Number(discount)) / Number(price)) * 100).toFixed(2);
            setPercentage(perc);
        } else {
            setPercentage('');
        }
    }, [price, discount]);

    return (
        <form onSubmit={saveProduct} className="text-white">
            <div className="flex flex-col md:flex-row w-full gap-4">
                <div className="flex-1">
                    <label>Product Name</label>
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={title}
                        onChange={ev => setTitle(ev.target.value)}
                        required
                    />
                </div>

                <div className="flex-1">
                    <label>Price</label>
                    <input
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={ev => setPrice(ev.target.value)}
                        step="0.01"
                        min="0"
                        required
                    />
                </div>
            </div>

            <label>Description</label>
            <textarea
                placeholder="Description"
                value={description}
                onChange={ev => setDescription(ev.target.value)}
                rows={4}
            ></textarea>

            <div className="flex flex-col md:flex-row w-full gap-4">

            </div>
            <label>Category</label>
            <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px] bg-black my-3 text-white">
                    <SelectValue placeholder="No Category Selected" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem>Uncategorized</SelectItem>
                    {
                        categories.length > 0 && categories.map(c => (
                            <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                        ))
                    }
                </SelectContent>
            </Select>

            <div className="flex items-center my-4">
                <label className="mr-2">Top Selling</label>
                <Switch
                    checked={topSelling}
                    onCheckedChange={setTopSelling}
                    id="top-selling-switch"
                />
            </div>

            <div className="flex flex-col md:flex-row w-full gap-4">
                {/* ...existing fields... */}
                <div className="flex-1">
                    <label>Discount</label>
                    <input
                        type="number"
                        placeholder="Discount"
                        value={discount}
                        onChange={ev => setDiscount(ev.target.value)}
                        min="0"
                    />
                </div>
                <div className="flex-1">
                    <label>Percentage (%)</label>
                    <input
                        type="text"
                        placeholder="Percentage"
                        value={percentage}
                        readOnly
                    />
                </div>
            </div>

            <div className="w-[300px]">
                {propertiesToFill.length > 0 && propertiesToFill.map(p => (
                    <div className="flex flex-col gap-x-4" key={p.name}>
                        <div>{p.name}</div>
                        <Select
                            value={productProperties[p.name] || ""}
                            onValueChange={val => setProductProp(p.name, val)}
                        >
                            <SelectTrigger className="w-[180px] bg-black my-3 text-white">
                                <SelectValue placeholder={`Select ${p.name}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {p.values.map(v => (
                                    <SelectItem key={v} value={v}>
                                        {v}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ))}
            </div>


            <label>Images</label>
            <NextFileUpload
                onUploadComplete={handleImageUpload}
                existingImages={existingImages}
            />

            <div className="flex gap-4 mt-6">
                <button
                    type="submit"
                    className="btn-primary bg-green-600 hover:bg-green-700 transition-colors"
                    disabled={!title || !price} // Disable if required fields are empty
                >
                    {_id ? 'Update Product' : 'Save Product'}
                </button>

                {/* <button
                    type="button"
                    onClick={handleBack}
                    className="btn-secondary bg-gray-600 hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button> */}
            </div>
        </form>
    )
}