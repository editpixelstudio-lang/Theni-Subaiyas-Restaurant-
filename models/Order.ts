import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  orderId: string;
  tableNumber: number;
  items: IOrderItem[];
  totalAmount: number;
  customerPhone?: string;
  status: 'Received' | 'Preparing' | 'Ready' | 'Served' | 'Delivered';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  paymentMethod: 'UPI' | 'Card' | 'Cash';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

const OrderItemSchema: Schema = new Schema({
  menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const OrderSchema: Schema = new Schema({
  orderId: { type: String, required: true, unique: true },
  tableNumber: { type: Number, required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Received', 'Preparing', 'Ready', 'Served', 'Delivered'], 
    default: 'Received' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed'], 
    default: 'Pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['UPI', 'Card', 'Cash'], 
    default: 'Cash' 
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  customerPhone: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
