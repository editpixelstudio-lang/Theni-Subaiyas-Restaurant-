import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET() {
  await dbConnect();
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }
    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { _id, __v, createdAt, updatedAt, ...updateData } = body;
    
    let settings = await Settings.findOne({});
    
    if (settings) {
      settings = await Settings.findByIdAndUpdate(settings._id, updateData, { new: true });
    } else {
      settings = await Settings.create(updateData);
    }
    
    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error: any) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update settings',
      details: error.message 
    }, { status: 500 });
  }
}
