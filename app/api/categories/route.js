import { Category } from "@/models/Category";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
// import { authOptions, isAdminRequest } from "../auth/[...nextauth]/route";
// import { authOptions, isAdminRequest } from "../auth/[...nextauth]";
import { isAdminRequest, authOptions } from "@/lib/auth";



export async function POST(request) {
    try {
        await mongooseConnect();
        await isAdminRequest(request);

        const { name, parentCategories, properties } = await request.json();

        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        const categoryDoc = await Category.create({ name: name.trim(), parent: parentCategories, properties });
        return NextResponse.json(categoryDoc, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}


export async function GET(request) {
    try {
        await mongooseConnect();
        await isAdminRequest(request);

        const categories = await Category.find({}).populate("parent", "name");
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function PUT(request) {
    await mongooseConnect();
    await isAdminRequest(request);

    const { name, parentCategories, properties, _id } = await request.json();
    await Category.updateOne(
        { _id },
        { name, parent: parentCategories, properties }
    );
    return NextResponse.json(true);
}

export async function DELETE(request) {
    await mongooseConnect();
    await isAdminRequest(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
        await Category.deleteOne({ _id: id });
        return Response.json(true);
    }
}