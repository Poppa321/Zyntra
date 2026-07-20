export type Role = "MANUFACTURER" | "DISTRIBUTOR";

export type UserDto = {
  id: string;
  email: string;
  fullName: string;
  businessName?: string;
  role: Role | null;
  phone?: string;
  city?: string;
  description?: string;
  verified: boolean;
  darkMode: boolean;
};

export type UpdateProfilePayload = {
  fullName: string;
  businessName?: string;
  phone?: string;
  city?: string;
  description?: string;
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
  email: string;
  password: string;
  fullName: string;
  businessName?: string;
  phone?: string;
  city?: string;
  role: Role;
};

export type PriceTierDto = {
  id: string;
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
};

export type PriceTierRequest = {
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
};

export type ProductCardDto = {
  id: string;
  name: string;
  imageUrl?: string;
  manufacturerId: string;
  manufacturerName: string;
  verified: boolean;
  baseUnitPrice: number;
  moq: number;
  unit: string;
};

export type ProductDetailDto = {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  imageUrl?: string;
  baseUnitPrice: number;
  unit: string;
  moq: number;
  stockQty: number;
  lowStockThreshold: number;
  leadTimeDaysMin: number;
  leadTimeDaysMax: number;
  active: boolean;
  manufacturerId: string;
  manufacturerName: string;
  verified: boolean;
  priceTiers: PriceTierDto[];
};

export type ProductCreateRequest = {
  name: string;
  sku: string;
  category: string;
  description?: string;
  imageUrl?: string;
  baseUnitPrice: number;
  unit: string;
  moq: number;
  stockQty: number;
  lowStockThreshold: number;
  leadTimeDaysMin: number;
  leadTimeDaysMax: number;
  tiers?: PriceTierRequest[];
};

export type StockUpdateRequest = {
  stockQty: number;
};

export type LowStockProductDto = {
  id: string;
  name: string;
  sku: string;
  stockQty: number;
  lowStockThreshold: number;
  unit: string;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type OrderStatusDto =
  | "PENDING"
  | "ACCEPTED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DECLINED"
  | "CANCELLED";

export type OrderDto = {
  id: string;
  orderNumber: string;
  distributorId: string;
  distributorBusinessName?: string;
  manufacturerId: string;
  manufacturerBusinessName?: string;
  status: OrderStatusDto;
  deliveryAddress?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  eta?: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus?: string;
};

export type OrderItemDto = {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderStatusHistoryDto = {
  status: OrderStatusDto;
  note?: string;
  createdAt: string;
};

export type OrderDetailDto = {
  order: OrderDto;
  items: OrderItemDto[];
  statusHistory: OrderStatusHistoryDto[];
};

export type OrderItemRequest = {
  productId: string;
  quantity: number;
};

export type CreateOrderRequest = {
  manufacturerId: string;
  deliveryAddress?: string;
  items: OrderItemRequest[];
};

export type OrderGroup = "active" | "completed" | "cancelled";

export type RecentOrderDto = {
  orderNumber: string;
  distributorBusinessName: string;
  total: number;
  status: OrderStatusDto;
};

export type ManufacturerDashboardDto = {
  revenue30d: number;
  orderCount: number;
  productCount: number;
  lowStockCount: number;
  recentOrders: RecentOrderDto[];
};

export type PaymentStatusDto = "INITIALIZED" | "SUCCESS" | "FAILED";

export type InitializePaymentResponse = {
  authorizationUrl: string;
  reference: string;
};

export type PaymentDto = {
  orderId: string;
  reference: string;
  status: PaymentStatusDto;
  paidAt?: string;
};

export type ConversationDto = {
  id: string;
  counterpartyId: string;
  counterpartyName?: string;
  lastMessagePreview?: string;
  unreadCount: number;
  createdAt: string;
};

export type MessageDto = {
  id: string;
  conversationId: string;
  senderId: string;
  orderId?: string;
  body: string;
  readAt?: string;
  createdAt: string;
};

export type ApiErrorBody = {
  timestamp?: string;
  status?: number;
  code?: string;
  message?: string;
  fieldErrors?: { field: string; message: string }[];
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
