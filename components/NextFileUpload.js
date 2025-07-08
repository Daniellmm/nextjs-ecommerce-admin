'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Image as ImageIcon, X, Check, FileImage } from 'lucide-react';
import { ReactSortable } from "react-sortablejs";

export default function NextFileUpload({ onUploadComplete, existingImages = [] }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Initialize with existing images when component mounts or existingImages change
    useEffect(() => {
        if (
            existingImages &&
            existingImages.length > 0 &&
            images.length === 0 // only set once to prevent re-loop
        ) {
            const formattedImages = existingImages.map((img, index) => ({
                id: `existing-${index}`,
                url: typeof img === 'string' ? img : img.url,
                name: img.name || img.originalFilename || `Image ${index + 1}`,
                size: img.size || 0,
                isExisting: true
            }));
            setImages(formattedImages);
        }
    }, [existingImages, images.length]);
    // Update parent component whenever images change
    useEffect(() => {
        const imageUrls = images.map(img => img.url);
        if (onUploadComplete) {
            onUploadComplete(imageUrls);
        }
    }, [images, onUploadComplete]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }, []);

    const handleFileSelect = useCallback((e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    }, []);


    const handleFiles = useCallback(async (files) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        setIsUploading(true);

        try {
            const formData = new FormData();
            imageFiles.forEach(file => formData.append('file', file));

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json(); // { uploads: [ { url, originalFilename }, ... ] }

            const newImages = data.uploads.map((upload, index) => ({
                id: Date.now() + index,
                url: upload.url,
                name: upload.originalFilename || imageFiles[index]?.name,
                size: imageFiles[index]?.size || 0,
                isExisting: false
            }));

            setImages(prev => [...prev, ...newImages]);

        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    }, []);


    const removeImage = useCallback((id) => {
        setImages(prev => {
            const updated = prev.filter(img => img.id !== id);
            // Clean up object URLs to prevent memory leaks (only for new uploads)
            const imageToRemove = prev.find(img => img.id === id);
            if (imageToRemove?.url && !imageToRemove.isExisting) {
                URL.revokeObjectURL(imageToRemove.url);
            }
            return updated;
        });
    }, []);

    const formatFileSize = useCallback((bytes) => {
        if (bytes === 0) return 'Unknown size';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    // Clean up object URLs on unmount
    React.useEffect(() => {
        return () => {
            images.forEach(image => {
                if (image.url && !image.isExisting) {
                    URL.revokeObjectURL(image.url);
                }
            });
        };
    }, [images]);

    // Function to reorder images (drag and drop functionality could be added later)
    const moveImage = useCallback((fromIndex, toIndex) => {
        setImages(prev => {
            const newImages = [...prev];
            const [removed] = newImages.splice(fromIndex, 1);
            newImages.splice(toIndex, 0, removed);
            return newImages;
        });
    }, []);

    return (
        <div className="w-full mx-auto p-6">
            {/* Upload Area */}
            <div
                className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-500 cursor-pointer
          backdrop-blur-sm
          ${isDragOver
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.02] shadow-xl'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gradient-to-br hover:bg-white/5 hover:shadow-lg'
                    }
          ${isUploading ? 'pointer-events-none opacity-70' : ''}
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Upload images"
                />

                {isUploading ? (
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FileImage className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-semibold text-gray-700">Processing images...</p>
                            <p className="text-sm text-gray-500">This may take a moment</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-6">
                        <div className={`
              w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500
              ${isDragOver
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-110'
                                : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300'
                            }
            `}>
                            <Upload size={32} className={isDragOver ? 'animate-bounce' : ''} />
                        </div>

                        <div className="space-y-3 max-w-md">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                {isDragOver ? 'Drop your images here!' : images.length > 0 ? 'Add More Images' : 'Upload Your Images'}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Drag and drop your images here, or{' '}
                                <span className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                                    click to browse
                                </span>
                            </p>
                            <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    JPG, PNG
                                </span>
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                    GIF, WebP
                                </span>
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                    Max 10MB
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-bold text-white flex items-center gap-3">
                            Product Images
                            <span className="text-sm font-normal bg-white/10 text-white px-3 py-1 rounded-full">
                                {images.length}
                            </span>
                        </h4>
                    </div>

                    <ReactSortable
                        list={images}
                        setList={setImages}
                        animation={200}

                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 xl:grid-cols-7 gap-6">
                        {images.map((image, index) => (
                            <div key={image.id} className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative">
                                    <Image
                                        src={image.url}
                                        alt={image.name || `Product image ${index + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                </div>

                                <div className="p-4 space-y-2">
                                    <p className="text-sm font-semibold text-gray-800 truncate" title={image.name}>
                                        {image.name || `Image ${index + 1}`}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{formatFileSize(image.size)}</span>
                                        <span className="flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full animate-pulse ${image.isExisting ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                                            {image.isExisting ? 'Existing' : 'Ready'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(image.id);
                                    }}
                                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110 shadow-lg"
                                    aria-label={`Remove ${image.name || 'image'}`}
                                >
                                    <X size={16} />
                                </button>

                                <div className={`absolute top-3 left-3 w-8 h-8 text-white rounded-full flex items-center justify-center shadow-lg ${image.isExisting ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gradient-to-r from-green-400 to-green-500'}`}>
                                    <Check size={16} />
                                </div>

                                {/* Optional: Add a badge to show if it's the first image (main image) */}
                                {index === 0 && (
                                    <div className="absolute bottom-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                        Main
                                    </div>
                                )}
                            </div>
                        ))}
                    </ReactSortable>
                </div>
            )
            }

            {/* Upload Summary */}
            {
                images.length > 0 && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                        <div className="flex items-center gap-3 text-green-800">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                <Check size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="font-semibold">
                                    {images.some(img => img.isExisting) ? 'Images Ready!' : 'Upload Complete!'}
                                </p>
                                <p className="text-sm text-green-600">
                                    {images.length} image{images.length !== 1 ? 's' : ''} ready for product
                                    {images.some(img => img.isExisting) && images.some(img => !img.isExisting) &&
                                        ` (${images.filter(img => img.isExisting).length} existing, ${images.filter(img => !img.isExisting).length} new)`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}