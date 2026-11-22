export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "customer" | "admin";
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category_id: string;
  category_name: string;
  price: number;
  stock: number;
  is_active: number;
  cover_color: string;
  symbol: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem extends Book {
  qty: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string;
  title: string;
  price: number;
  quantity: number;
  total_price: number;
}

export type OrderStatus = "Chờ xác nhận" | "Đã xác nhận" | "Đang giao" | "Hoàn thành" | "Đã hủy";

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  phone: string;
  address: string;
  note: string | null;
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_method: string;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}
