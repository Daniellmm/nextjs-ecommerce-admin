import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Products";
import { isAdminRequest, authOptions } from "@/lib/auth";

export async function POST(request) {
  await mongooseConnect();
  const { title, description, price, images, category, properties, discount, percentage, topSelling} = await request.json();
  const productDoc = await Product.create({ title, description, price, images, category, properties, discount, percentage, topSelling });
  return Response.json(productDoc);
}

export async function GET(request) {
  await mongooseConnect();
  await isAdminRequest(request);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const product = await Product.findById(id);
    return Response.json(product);
  } else {
    const products = await Product.find();
    return Response.json(products);
  }
}

export async function PUT(request) {
  await mongooseConnect();
  await isAdminRequest(request);
  const { title, description, price, images, category, properties, discount, percentage, topSelling, _id } = await request.json();
  await Product.updateOne({ _id }, { title, description, price, images, category, properties, discount, percentage, topSelling })
  return Response.json(true)
}

export async function DELETE(request) {
  await mongooseConnect();
  await isAdminRequest(request);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    await Product.deleteOne({ _id: id });
    return Response.json(true);
  }
}