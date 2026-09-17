// Mirrors ../../../src/lib/types.ts (the web app's types). Keep in sync by hand
// until the backend migration lands and both apps can share one types package.

export type Category = 'Spirits' | 'Wine' | 'Beer' | 'Snacks' | 'Bundles' | 'Vapes';

export interface Product {
  id: string;
  name: string;
  brand?: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  rating: number;
  isAgeRestricted: boolean;
  isFeatured?: boolean;
  stockStatus?: 'in-stock' | 'out-of-stock';
  stockQuantity?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone?: string;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'out-for-delivery' | 'completed' | 'cancelled';
  orderDate: string;
  expectedDeliveryTime?: string;
  paymentStatus: 'paid' | 'unpaid';
  items: OrderItem[];
}

export interface UserProfile {
  id: string;
  firebaseUid: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  ageVerified: boolean;
  loyaltyPoints: number;
  isAdmin: boolean;
  isBlocked?: boolean;
}

export interface Pairing {
  id: string;
  name: string;
  description: string;
  liquorProductId: string;
  snackProductId: string;
  imageUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
