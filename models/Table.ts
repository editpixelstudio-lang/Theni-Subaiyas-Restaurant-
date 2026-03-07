import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
  number: number;
  status: 'active' | 'inactive';
}

const TableSchema: Schema = new Schema({
  number: { type: Number, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export default mongoose.models.Table || mongoose.model<ITable>('Table', TableSchema);
