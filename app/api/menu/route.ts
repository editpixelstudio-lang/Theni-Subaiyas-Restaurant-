import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MenuItem from '@/models/MenuItem';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Connecting to DB...");
    await dbConnect();
    console.log("Fetching items...");
    const items = await MenuItem.find({}).sort({ category: 1, name: 1 });
    console.log(`Found ${items.length} items.`);
    return NextResponse.json({ 
      success: true, 
      count: items.length,
      items 
    }, { status: 200 });
  } catch (error: any) {
    console.error("Menu API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch menu items',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const newItem = new MenuItem(body);
    const savedItem = await newItem.save();
    return NextResponse.json({ success: true, item: savedItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create menu item' }, { status: 500 });
  }
}
