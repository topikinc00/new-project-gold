export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  address?: string;
  phone?: string;
  role: 'user' | 'admin';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: number;
  stock: number;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  paymentProofUrl?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  invoiceNumber: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
