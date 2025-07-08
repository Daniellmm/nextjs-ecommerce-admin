import { v2 as cloudinary } from 'cloudinary';
import { mongooseConnect } from "@/lib/mongoose";
import { NextResponse } from 'next/server';
import { isAdminRequest, authOptions } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    await mongooseConnect();
    await isAdminRequest(req);

    const formData = await req.formData();
    const files = formData.getAll('file');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploads = [];

    for (const file of files) {
      const originalFilename = file.name;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'next-ecommerce',
              resource_type: 'auto',
              
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });

        uploads.push({
          url: result.secure_url,
          originalFilename, 
        });
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
      }
    }

    if (uploads.length === 0) {
      return NextResponse.json({ error: 'Failed to upload any files' }, { status: 500 });
    }

    return NextResponse.json({ uploads }, { status: 200 });

  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(req) {
  await isAdminRequest(req);
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}