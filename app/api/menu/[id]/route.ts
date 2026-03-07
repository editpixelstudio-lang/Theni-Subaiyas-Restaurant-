import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MenuItem from '@/models/MenuItem';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const body = await req.json();
    const updatedItem = await MenuItem.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedItem) return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true, item: updatedItem }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(params.id);
    if (!deletedItem) return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
  }
}
