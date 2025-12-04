import mongoose from 'mongoose';

const customerInfoSchema = new mongoose.Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  country: { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'COD' },
    status: { type: String, default: 'pending' },
    customerInfo: customerInfoSchema,
    tracking: [
      {
        status: String,
        message: String,
        location: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
