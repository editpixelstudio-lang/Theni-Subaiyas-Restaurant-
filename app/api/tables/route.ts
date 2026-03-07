import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Table from '@/models/Table';

export async function GET() {
  await dbConnect();
  try {
    const tables = await Table.find({}).sort({ number: 1 });
    return NextResponse.json({ success: true, tables }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch tables' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const newTable = new Table(body);
    const savedTable = await newTable.save();
    return NextResponse.json({ success: true, table: savedTable }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Table number already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create table' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    const updatedTable = await Table.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, table: updatedTable }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update table' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await Table.findByIdAndDelete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete table' }, { status: 500 });
  }
}
