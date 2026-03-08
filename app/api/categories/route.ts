import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    
    const category = await Category.create({ name });
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    console.error('Category Create Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.code === 11000 ? 'Category already exists' : 'Failed to create category' 
    }, { status: 500 });
  }
}
