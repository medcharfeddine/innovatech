export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const BRANDS = [
  'apple',
  'asus',
  'canon',
  'dell',
  'hp',
  'lenovo',
  'samsung'
];

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Computers',
  'Accessories',
  'Mobile Phones',
  'Tablets'
];

export const ADMIN_ACTIONS = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
  VIEW: 'view'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Bank Transfer'
];
