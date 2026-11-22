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
