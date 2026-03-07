import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  restaurantName: string;
  mobileNumber: string;
  address: string;
  logoUrl?: string;
  upiId?: string;
  primaryColor: string;
  accentColor: string;
  bgVariant: 'light' | 'dark' | 'glass';
}

const SettingsSchema: Schema = new Schema({
  restaurantName: { type: String, required: true, default: 'Theni Subaiyas' },
  mobileNumber: { type: String, required: true, default: '9876543210' },
  address: { type: String, required: true, default: 'Theni, Tamil Nadu' },
  logoUrl: { type: String, default: '' },
  upiId: { type: String, default: 'kadamalairamesh-1@oksbi' },
  primaryColor: { type: String, default: '#E53935' },
  accentColor: { type: String, default: '#FF7043' },
  bgVariant: { type: String, enum: ['light', 'dark', 'glass'], default: 'light' },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
