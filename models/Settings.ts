import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  restaurantName: string;
  mobileNumber: string;
  address: string;
  logoUrl?: string;
  upiId?: string;
  primaryColor: string;
  accentColor: string;
  gradientStart: string;
  gradientEnd: string;
  bgVariant: 'light' | 'dark' | 'glass';
  headerColor: string;
}

const SettingsSchema: Schema = new Schema({
  restaurantName: { type: String, required: true, default: 'Theni Subaiyas' },
  mobileNumber: { type: String, required: true, default: '9876543210' },
  address: { type: String, required: true, default: 'Theni, Tamil Nadu' },
  logoUrl: { type: String, default: '' },
  upiId: { type: String, default: 'kadamalairamesh-1@oksbi' },
  primaryColor: { type: String, default: '#E53935' },
  accentColor: { type: String, default: '#FF7043' },
  gradientStart: { type: String, default: '#E53935' },
  gradientEnd: { type: String, default: '#B71C1C' },
  bgVariant: { type: String, enum: ['light', 'dark', 'glass'], default: 'light' },
  headerColor: { type: String, default: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)' },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
