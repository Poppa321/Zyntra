import { formatCurrency, formatCurrencyPerUnit, formatQtyRange, formatRelativeTime } from "@/lib/format";
import type {
  AddressDto,
  AddressLabelDto,
  ConversationDto,
  MessageDto,
  ManufacturerDashboardDto,
  NotificationDto,
  NotificationTypeDto,
  OrderDto,
  OrderStatusDto,
  ProductCardDto,
  ProductDetailDto,
  UserDto,
} from "@/api/types";
import type {
  Address,
  AddressLabel,
  BusinessProfile,
  Conversation,
  ChatMessage,
  IncomingOrder,
  IncomingOrderStatus,
  InventoryItem,
  Notification,
  NotificationType,
  Order,
  OrderStatus,
  PriceTier,
  Product,
} from "@/types/domain";

// The list endpoint doesn't include per-product rating aggregates (would be
// an N+1 query), so cards fall back to a neutral placeholder until opened.
const PLACEHOLDER_RATING = 4.8;

export function mapProductCard(dto: ProductCardDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    imageUrl: dto.imageUrl,
    manufacturer: dto.manufacturerName,
    manufacturerId: dto.manufacturerId,
    category: "",
    rating: PLACEHOLDER_RATING,
    reviewCount: 0,
    price: formatCurrencyPerUnit(dto.baseUnitPrice, dto.unit),
    unit: dto.unit,
    moq: `MOQ ${dto.moq.toLocaleString()} ${dto.unit}s`,
    inStock: "",
    leadTime: "",
    basePrice: dto.baseUnitPrice,
    baseQty: dto.moq,
    tiers: [],
    featured: dto.featured,
  };
}

export function mapProductDetail(dto: ProductDetailDto): Product {
  const tiers: PriceTier[] = dto.priceTiers
    .slice()
    .sort((a, b) => a.minQty - b.minQty)
    .map((tier, index, sorted) => ({
      range: formatQtyRange(tier.minQty, tier.maxQty, dto.unit),
      price: formatCurrencyPerUnit(tier.unitPrice, dto.unit),
      best: index === sorted.length - 1 && sorted.length > 1,
      minQty: tier.minQty,
      maxQty: tier.maxQty,
      unitPrice: tier.unitPrice,
    }));

  return {
    id: dto.id,
    name: dto.name,
    imageUrl: dto.imageUrl,
    manufacturer: dto.manufacturerName,
    manufacturerId: dto.manufacturerId,
    category: dto.category,
    rating: dto.reviewCount > 0 ? dto.averageRating : PLACEHOLDER_RATING,
    reviewCount: dto.reviewCount,
    price: formatCurrencyPerUnit(dto.baseUnitPrice, dto.unit),
    unit: dto.unit,
    moq: `MOQ ${dto.moq.toLocaleString()} ${dto.unit}s`,
    inStock: `In stock · ${dto.stockQty.toLocaleString()} ${dto.unit}s`,
    leadTime: `Lead time ${dto.leadTimeDaysMin}–${dto.leadTimeDaysMax} days`,
    basePrice: dto.baseUnitPrice,
    baseQty: dto.moq,
    tiers:
      tiers.length > 0
        ? tiers
        : [{
            range: `${dto.moq}+ ${dto.unit}s`,
            price: formatCurrencyPerUnit(dto.baseUnitPrice, dto.unit),
            minQty: dto.moq,
            maxQty: null,
            unitPrice: dto.baseUnitPrice,
          }],
    featured: dto.featured,
  };
}

const ORDER_STATUS_LABEL: Record<OrderStatusDto, OrderStatus> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
};

export function orderStatusLabel(status: OrderStatusDto): OrderStatus {
  return ORDER_STATUS_LABEL[status];
}

export function mapDistributorOrder(dto: OrderDto): Order {
  return {
    id: `#${dto.orderNumber}`,
    orderId: dto.id,
    counterpartyId: dto.manufacturerId,
    itemsSummary: dto.manufacturerBusinessName ?? "",
    total: formatCurrency(dto.total),
    status: orderStatusLabel(dto.status),
  };
}

const INCOMING_STATUS_MAP: Partial<Record<OrderStatusDto, IncomingOrderStatus>> = {
  PENDING: "new",
  ACCEPTED: "accepted",
  IN_TRANSIT: "shipped",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
};

export function mapIncomingOrder(dto: OrderDto): IncomingOrder {
  return {
    id: dto.orderNumber,
    orderId: dto.id,
    counterpartyId: dto.distributorId,
    customer: dto.distributorBusinessName ?? "",
    location: "",
    summary: dto.deliveryAddress ?? "",
    total: formatCurrency(dto.total),
    status: INCOMING_STATUS_MAP[dto.status] ?? "new",
  };
}

export function mapInventoryItem(dto: ProductDetailDto): InventoryItem {
  return {
    id: dto.id,
    name: dto.name,
    sku: `SKU ${dto.sku} · ${formatCurrency(dto.baseUnitPrice)}`,
    units: `${dto.stockQty.toLocaleString()} units`,
    stockQty: dto.stockQty,
    low: dto.stockQty <= dto.lowStockThreshold,
    featured: dto.featured,
  };
}

export function mapBusinessProfile(dto: UserDto): BusinessProfile {
  return {
    fullName: dto.fullName,
    companyName: dto.businessName ?? "",
    email: dto.email,
    phone: dto.phone ?? "",
    location: dto.city ?? "",
    description: dto.description ?? "",
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
    timestamp: formatRelativeTime(dto.createdAt),
    read: dto.read,
  };
}

const ADDRESS_LABEL_FROM_DTO: Record<AddressLabelDto, AddressLabel> = {
  WAREHOUSE: "Warehouse",
  OFFICE: "Office",
  STOREFRONT: "Storefront",
  OTHER: "Other",
};

const ADDRESS_LABEL_TO_DTO: Record<AddressLabel, AddressLabelDto> = {
  Warehouse: "WAREHOUSE",
  Office: "OFFICE",
  Storefront: "STOREFRONT",
  Other: "OTHER",
};

export function mapAddress(dto: AddressDto): Address {
  return {
    id: dto.id,
    label: ADDRESS_LABEL_FROM_DTO[dto.label] ?? "Other",
    line1: dto.line1,
    city: dto.city,
    region: dto.region,
    phone: dto.phone,
    isDefault: dto.isDefault,
  };
}

export function addressLabelToDto(label: AddressLabel): AddressLabelDto {
  return ADDRESS_LABEL_TO_DTO[label] ?? "OTHER";
}

export function mapDashboard(dto: ManufacturerDashboardDto, businessName: string) {
  return {
    businessName,
    revenue: formatCurrency(dto.revenue30d),
    ordersFulfilled: dto.orderCount,
    productCount: dto.productCount,
    lowStockCount: dto.lowStockCount,
    inquiryCount: 0,
    lowStockProductNames: [] as string[],
    recentOrders: dto.recentOrders.map((order) => ({
      id: `${order.orderNumber} · ${order.distributorBusinessName}`,
      total: formatCurrency(order.total),
      tag: (order.status === "PENDING" ? "NEW" : "SHIPPED") as "NEW" | "SHIPPED",
    })),
  };
}

export function mapConversation(dto: ConversationDto): Conversation {
  return {
    id: dto.id,
    counterpartyId: dto.counterpartyId,
    counterpartyName: dto.counterpartyName ?? "Unknown",
    lastMessagePreview: dto.lastMessagePreview ?? "",
    unreadCount: dto.unreadCount,
    createdAt: dto.createdAt,
  };
}

export function mapMessage(dto: MessageDto, selfId: string): ChatMessage {
  return {
    id: dto.id,
    conversationId: dto.conversationId,
    body: dto.body,
    createdAt: dto.createdAt,
    fromSelf: dto.senderId === selfId,
    readAt: dto.readAt,
  };
}
