import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure the public/uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uniqueFilename = `${Date.now()}-${file.name.replace(/\\s+/g, '-')}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      imageUrl: `/uploads/${uniqueFilename}` 
    }, { status: 200 });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Uploads are disabled on Vercel. Please use an "Image URL" instead.' 
    }, { status: 500 });
  }
}
