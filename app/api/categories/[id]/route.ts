import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const id = params.id;
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Category deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}
