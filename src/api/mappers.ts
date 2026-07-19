import { formatCurrency, formatCurrencyPerUnit, formatQtyRange } from "@/lib/format";
import type {
  AddressDto,
  AddressLabelDto,
  BusinessProfileDto,
  CartDto,
  DashboardStatsDto,
  InventoryItemDto,
  NotificationDto,
  NotificationTypeDto,
  OrderDto,
  OrderStatusDto,
  PaymentMethodDto,
  ProductDto,
} from "@/api/types";
import type {
  Address,
  AddressLabel,
  BusinessProfile,
  CartItem,
  IncomingOrder,
  IncomingOrderStatus,
  InventoryItem,
  Notification,
  NotificationType,
  Order,
  OrderStatus,
  PaymentMethod,
  PriceTier,
  Product,
} from "@/data/sampleData";

export function mapProduct(dto: ProductDto): Product {
  const tiers: PriceTier[] = dto.priceTiers.map((tier) => ({
    range: formatQtyRange(tier.minQty, tier.maxQty, dto.unit),
    price: formatCurrencyPerUnit(tier.unitPrice, dto.unit),
    best: tier.isBestValue,
  }));

  return {
    id: dto.id,
    name: dto.name,
    manufacturer: dto.manufacturerName,
    category: dto.category,
    rating: dto.rating,
    price: formatCurrencyPerUnit(dto.basePrice, dto.unit),
    unit: dto.unit,
    moq: `MOQ ${dto.minOrderQty.toLocaleString()} ${dto.unit}s`,
    inStock: `In stock · ${dto.stockQuantity.toLocaleString()} ${dto.unit}s`,
    leadTime: `Lead time ${dto.leadTime}`,
    basePrice: dto.basePrice,
    baseQty: dto.minOrderQty,
    tiers: tiers.length > 0 ? tiers : [{ range: `${dto.minOrderQty}+ ${dto.unit}s`, price: formatCurrencyPerUnit(dto.basePrice, dto.unit) }],
  };
}

const DISTRIBUTOR_STATUS_MAP: Record<OrderStatusDto, OrderStatus> = {
  PROCESSING: "Processing",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Delivered",
  NEW: "Processing",
  SHIPPED: "In Transit",
};

export function mapDistributorOrder(dto: OrderDto): Order {
  return {
    id: dto.orderNumber,
    itemsSummary: dto.itemsSummary,
    total: formatCurrency(dto.totalAmount),
    status: DISTRIBUTOR_STATUS_MAP[dto.status] ?? "Processing",
  };
}

const INCOMING_STATUS_MAP: Record<OrderStatusDto, IncomingOrderStatus> = {
  NEW: "new",
  PROCESSING: "new",
  SHIPPED: "shipped",
  IN_TRANSIT: "shipped",
  DELIVERED: "shipped",
  CANCELLED: "shipped",
};

export function mapIncomingOrder(dto: OrderDto): IncomingOrder {
  return {
    id: dto.orderNumber,
    customer: dto.counterpartyName,
    location: dto.counterpartyLocation ?? "",
    summary: dto.itemsSummary,
    total: formatCurrency(dto.totalAmount),
    status: INCOMING_STATUS_MAP[dto.status] ?? "new",
  };
}

export function mapInventoryItem(dto: InventoryItemDto): InventoryItem {
  return {
    id: dto.id,
    name: dto.name,
    sku: `SKU ${dto.sku} · ${formatCurrency(dto.unitPrice)}`,
    units: `${dto.stockQuantity.toLocaleString()} units`,
    low: dto.stockQuantity <= dto.lowStockThreshold,
  };
}

export function mapCartItem(dto: CartDto["items"][number]): CartItem {
  return {
    product: mapProduct(dto.product),
    quantity: dto.quantity,
  };
}

const NOTIFICATION_TYPE_MAP: Record<NotificationTypeDto, NotificationType> = {
  ORDER: "order",
  INVENTORY: "inventory",
  SYSTEM: "system",
  PROMO: "promo",
};

export function mapNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    type: NOTIFICATION_TYPE_MAP[dto.type] ?? "system",
    title: dto.title,
    body: dto.body,
    timestamp: dto.createdAt,
    read: dto.read,
  };
}

const ADDRESS_LABEL_MAP: Record<AddressLabelDto, AddressLabel> = {
  WAREHOUSE: "Warehouse",
  OFFICE: "Office",
  STOREFRONT: "Storefront",
  OTHER: "Other",
};

export function mapAddress(dto: AddressDto): Address {
  return {
    id: dto.id,
    label: ADDRESS_LABEL_MAP[dto.label] ?? "Other",
    line1: dto.line1,
    city: dto.city,
    region: dto.region,
    phone: dto.phone,
    isDefault: dto.isDefault,
  };
}

export function mapPaymentMethod(dto: PaymentMethodDto): PaymentMethod {
  return {
    id: dto.id,
    type: dto.type === "MOBILE_MONEY" ? "mobile_money" : "card",
    label: dto.provider,
    detail: dto.detail,
    holderName: dto.holderName,
    isDefault: dto.isDefault,
  };
}

export function mapBusinessProfile(dto: BusinessProfileDto): BusinessProfile {
  return {
    fullName: dto.fullName,
    companyName: dto.companyName,
    email: dto.email,
    phone: dto.phone,
    location: dto.location,
    description: dto.description,
  };
}

export function mapDashboard(dto: DashboardStatsDto) {
  return {
    businessName: dto.businessName,
    revenue: formatCurrency(dto.revenueLast30Days),
    ordersFulfilled: dto.ordersFulfilledWithoutDelay,
    productCount: dto.productCount,
    lowStockCount: dto.lowStockCount,
    inquiryCount: dto.inquiryCount,
    lowStockProductNames: dto.lowStockProductNames,
    recentOrders: dto.recentOrders.map((order) => ({
      id: `${order.orderNumber} · ${order.counterpartyName}`,
      total: formatCurrency(order.totalAmount),
      tag: (order.status === "NEW" ? "NEW" : "SHIPPED") as "NEW" | "SHIPPED",
    })),
  };
}
