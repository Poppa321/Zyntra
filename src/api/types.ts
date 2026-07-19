export type Role = "MANUFACTURER" | "DISTRIBUTOR";

export type UserDto = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  companyName: string;
  location?: string;
};

export type AuthResponseDto = {
  token: string;
  user: UserDto;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  companyName: string;
  email: string;
  password: string;
  role: Role;
};

export type PriceTierDto = {
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
  isBestValue: boolean;
};

export type ProductDto = {
  id: string;
  name: string;
  description?: string;
  manufacturerId: string;
  manufacturerName: string;
  category: string;
  rating: number;
  unit: string;
  basePrice: number;
  minOrderQty: number;
  stockQuantity: number;
  leadTime: string;
  images: string[];
  priceTiers: PriceTierDto[];
};

export type ManufacturerDto = {
  id: string;
  name: string;
  location: string;
  verified: boolean;
  rating: number;
};

export type CartItemDto = {
  id: string;
  product: ProductDto;
  quantity: number;
};

export type CartDto = {
  id: string;
  items: CartItemDto[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export type OrderStatusDto = "PROCESSING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED" | "NEW" | "SHIPPED";

export type OrderDto = {
  id: string;
  orderNumber: string;
  status: OrderStatusDto;
  itemsSummary: string;
  totalAmount: number;
  counterpartyName: string;
  counterpartyLocation?: string;
  createdAt: string;
};

export type TrackingStepDto = {
  key: string;
  label: string;
  status: "done" | "current" | "pending";
  timestamp?: string;
};

export type OrderTrackingDto = {
  orderId: string;
  steps: TrackingStepDto[];
  courierName: string;
  courierVehicle: string;
  courierHub: string;
  estimatedDelivery: string;
};

export type InventoryItemDto = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
};

export type DashboardStatsDto = {
  businessName: string;
  revenueLast30Days: number;
  ordersFulfilledWithoutDelay: number;
  productCount: number;
  lowStockCount: number;
  inquiryCount: number;
  lowStockProductNames: string[];
  recentOrders: OrderDto[];
};

export type CreateProductPayload = {
  name: string;
  description?: string;
  category: string;
  unitPrice: number;
  unit: string;
  minOrderQty: number;
  stockQuantity: number;
  contactPhone: string;
  businessLocation: string;
};

export type NotificationTypeDto = "ORDER" | "INVENTORY" | "SYSTEM" | "PROMO";

export type NotificationDto = {
  id: string;
  type: NotificationTypeDto;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type AddressLabelDto = "WAREHOUSE" | "OFFICE" | "STOREFRONT" | "OTHER";

export type AddressDto = {
  id: string;
  label: AddressLabelDto;
  line1: string;
  city: string;
  region: string;
  phone: string;
  isDefault: boolean;
};

export type CreateAddressPayload = {
  label: AddressLabelDto;
  line1: string;
  city: string;
  region: string;
  phone: string;
};

export type PaymentMethodTypeDto = "CARD" | "MOBILE_MONEY";

export type PaymentMethodDto = {
  id: string;
  type: PaymentMethodTypeDto;
  provider: string;
  detail: string;
  holderName: string;
  isDefault: boolean;
};

export type CreatePaymentMethodPayload = {
  type: PaymentMethodTypeDto;
  provider: string;
  detail: string;
  holderName: string;
};

export type BusinessProfileDto = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  location: string;
  description: string;
};
