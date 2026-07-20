// UI-facing domain models, mapped from backend DTOs in src/api/mappers.ts.

export type PriceTier = {
  range: string;
  price: string;
  best?: boolean;
  minQty?: number;
  maxQty?: number | null;
  unitPrice?: number;
};

export type Product = {
  id: string;
  name: string;
  manufacturer: string;
  manufacturerId: string;
  category: string;
  rating: number;
  price: string;
  unit: string;
  moq: string;
  inStock: string;
  tiers: PriceTier[];
  leadTime: string;
  basePrice: number;
  baseQty: number;
};

export const categories = ["All", "Grains", "Flour", "Oils", "Cocoa", "Feed", "Confectionery"];

export type Manufacturer = {
  id: string;
  name: string;
  location: string;
  rating: number;
  verified: boolean;
  tagline: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderStatus =
  | "Pending"
  | "Accepted"
  | "In Transit"
  | "Out for Delivery"
  | "Delivered"
  | "Declined"
  | "Cancelled";

export type Order = {
  id: string;
  orderId: string;
  counterpartyId: string;
  itemsSummary: string;
  total: string;
  status: OrderStatus;
};

export type IncomingOrderStatus = "new" | "accepted" | "shipped" | "out_for_delivery" | "delivered";

export type IncomingOrder = {
  id: string;
  orderId: string;
  counterpartyId: string;
  customer: string;
  location: string;
  summary: string;
  total: string;
  status: IncomingOrderStatus;
};

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  units: string;
  stockQty: number;
  low: boolean;
};

export type NotificationType = "order" | "inventory" | "system" | "promo";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
};

export type AddressLabel = "Warehouse" | "Office" | "Storefront" | "Other";

export type Address = {
  id: string;
  label: AddressLabel;
  line1: string;
  city: string;
  region: string;
  phone: string;
  isDefault: boolean;
};

export type Conversation = {
  id: string;
  counterpartyId: string;
  counterpartyName: string;
  lastMessagePreview: string;
  unreadCount: number;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  body: string;
  createdAt: string;
  fromSelf: boolean;
  readAt?: string;
};

export type BusinessProfile = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  location: string;
  description: string;
};
