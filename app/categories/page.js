"use client";
import Layout from "@/components/Layouts";
import axios from "axios";
import { useState, useEffect } from "react";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Swal from 'sweetalert2';
import Loading from "@/components/Loading";

export default function Categories() {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [parentCategories, setParentCategories] = useState('');
    const [categories, setCategories] = useState([]);
    const [editedCategory, setEditedCategory] = useState(null);
    const [properties, setProperties] = useState([]);

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

    async function fetchCategories() {
        const res = await axios.get("/api/categories");
        setCategories(res.data);
        setPageLoading(false)
    }

    async function saveCategory(ev) {
        ev.preventDefault();

        const data = {
            name,
            parentCategories: parentCategories || null,
            properties: properties.map(p => ({
                name: p.name, values: p.value.split(',')
            }))
        }

        setIsLoading(true);
        setError('');
        setSuccess('');
        if (editedCategory) {
            data._id = editedCategory._id;
            await axios.put('/api/categories', data);
            setName('')
            setParentCategories('')
            setIsLoading(false)
            setEditedCategory(null)
            setProperties([])
            Toast.fire({
                icon: "success",
                title: "Category edit successfully!"
            });
            fetchCategories();
        } else {
            try {
                const response = await axios.post('/api/categories', data);
                // console.log('Category created:', response.data);
                setName('');
                setProperties([])
                setParentCategories('')
                Toast.fire({
                    icon: "success",
                    title: "Category created successfully!"
                });
                fetchCategories();

                setSuccess('Category created successfully!');
            } catch (error) {
                console.error('Error creating category:', error);
                Toast.fire({
                    icon: "error",
                    title: "Failed to create category"
                });
                setError(error.response?.data?.error || 'Failed to create category');
            } finally {
                setIsLoading(false);

            }
        }


    }

    function editCategory(cat) {
        setEditedCategory(cat);
        setName(cat.name);
        setParentCategories(cat.parent?._id || '');
        setProperties(
            (cat.properties && cat.properties.length > 0)
                ? cat.properties.map(p => ({
                    name: p.name,
                    value: p.values ? p.values.join(',') : ''
                }))
                : []
        );

    }

    const deleteCategory = async (cat) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${cat.name}?`,
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
                await axios.delete(`/api/categories?id=${cat._id}`);
                Toast.fire({
                    icon: "success",
                    title: "Product deleted successfully",
                });

                // Update UI by removing deleted product
                setCategories((prev) => prev.filter((c) => c._id !== cat._id));
            } catch (err) {
                console.error("Delete error", err);
                Toast.fire({
                    icon: "error",
                    title: "Failed to delete product",
                });
            }
        }
    }

    function addProperty() {
        setProperties(prev => {
            return [...prev, { name: '', value: '' }]
        })
    }

    function handlePropertyNameChange(index, property, newName) {
        setProperties(
            prev => {
                const properties = [...prev];
                properties[index].name = newName;
                return properties
            }
        )
    }

    function handlePropertyValueChange(index, property, newValue) {
        setProperties(
            prev => {
                const properties = [...prev];
                properties[index].value = newValue;
                return properties
            }
        )
    }

    function removeProperty(indexToRomove) {
        setProperties(prev => {
            return [...prev].filter((p, pIndex) => {
                return pIndex !== indexToRomove;
            });

        })
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <Layout>
            {
                pageLoading ? (
                    <Loading size="lg" text="Loading Categories " />
                ) : (
                    <>
                        <h1 className="text-white text-2xl pb-3">Category Page</h1>

                        <label className="text-white text-sm">
                            {editedCategory
                                ? <>Edit Category <strong className="text-xl">{editedCategory.name}</strong></>
                                : 'New Category Name'
                            }
                        </label>
                        <form onSubmit={saveCategory}>
                            <div className="flex flex-col w-full">
                                <div>
                                    <div className="flex gap-x-4 justify-center items-center">
                                        <input
                                            className="mb-0 text-white"
                                            type="text"
                                            placeholder="Category name"
                                            value={name}
                                            onChange={ev => setName(ev.target.value)}
                                            disabled={isLoading}
                                        />

                                        <Select value={parentCategories} onValueChange={setParentCategories}>
                                            <SelectTrigger className="w-[180px] bg-black text-white">
                                                <SelectValue placeholder="No Parent Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* <SelectItem value=''>None</SelectItem> */}
                                                <SelectItem>No Parent Category</SelectItem>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat._id} value={cat._id}>

                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="text-white space-y-1 pb-7">
                                        <label className="block">Properties</label>
                                        <button
                                            onClick={addProperty}
                                            type="button"
                                            className="py-2 px-3 bg-blue-500 rounded-md">
                                            Add Properties
                                        </button>
                                    </div>
                                </div>

                                {
                                    // property input 
                                    properties.length > 0 && properties.map((property, index) => (
                                        <div className="flex gap-x-3">
                                            <input
                                                type="text"
                                                onChange={ev => handlePropertyNameChange(index, property, ev.target.value)}
                                                value={property.name}
                                                className=" placeholder:text-gray-400 text-white"
                                                placeholder="property name (e.g: color)"
                                            />

                                            <input
                                                type="text"
                                                onChange={ev => handlePropertyValueChange(index, property, ev.target.value)}
                                                value={property.value}
                                                className=" placeholder:text-gray-400  text-white"
                                                placeholder="value separated with comma"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => removeProperty(index)}
                                                className="size-10 flex justify-center text-white bg-red-600 p-2 rounded-md hover:bg-red-700 transition"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                }

                                <div className="flex justify-end pb-3">
                                    <button
                                        type="submit"
                                        className="btn-primary text-white bg-green-600"
                                        disabled={isLoading || !name}
                                    >
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>


                            </div>

                        </form>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-white">Category Name</TableHead>
                                    <TableHead className="text-white">Parent Category</TableHead>
                                    <TableHead className="text-white">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="text-white">
                                {categories.map((cat) => (
                                    <TableRow key={cat._id}>
                                        <TableCell>{cat.name}</TableCell>
                                        <TableCell>{cat.parent?.name || '—'}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-x-5">
                                                <button
                                                    onClick={() => editCategory(
                                                        cat
                                                    )}
                                                    type="button"
                                                    className="size-10 flex justify-center it bg-amber-500 p-2 rounded-md hover:bg-amber-600 transition"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={() => deleteCategory(
                                                        cat
                                                    )}
                                                    type="button"
                                                    className="size-10 flex justify-center it bg-red-600 p-2 rounded-md hover:bg-red-700 transition"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                )
            }

        </Layout>
    );
}