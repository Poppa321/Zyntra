export type PriceTier = {
  range: string;
  price: string;
  best?: boolean;
};

export type Product = {
  id: string;
  name: string;
  manufacturer: string;
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

export const products: Product[] = [
  {
    id: "cocoa-butter-25kg",
    name: "Cocoa Butter 25kg",
    manufacturer: "Ashanti AgroWorks",
    category: "Food & Bev",
    rating: 4.8,
    price: "₵1,240 / unit",
    unit: "unit",
    moq: "MOQ 20 units",
    inStock: "In stock · 1,420 units",
    leadTime: "Lead time 3–5 days",
    basePrice: 1240,
    baseQty: 20,
    tiers: [
      { range: "20 – 99 units", price: "₵1,240 / unit" },
      { range: "100 – 499 units", price: "₵1,150 / unit", best: true },
      { range: "500+ units", price: "₵1,060 / unit" },
    ],
  },
  {
    id: "kente-fabric-roll",
    name: "Kente Fabric Roll",
    manufacturer: "Bonwire Textiles",
    category: "Textiles",
    rating: 4.8,
    price: "₵860 / roll",
    unit: "roll",
    moq: "MOQ 50 rolls",
    inStock: "In stock · 640 rolls",
    leadTime: "Lead time 5–7 days",
    basePrice: 860,
    baseQty: 50,
    tiers: [
      { range: "50 – 199 rolls", price: "₵860 / roll" },
      { range: "200 – 499 rolls", price: "₵790 / roll", best: true },
      { range: "500+ rolls", price: "₵720 / roll" },
    ],
  },
  {
    id: "bottled-water-500ml",
    name: "Bottled Water 500ml",
    manufacturer: "AquaPure Ltd",
    category: "Beverages",
    rating: 4.8,
    price: "₵38 / pack",
    unit: "pack",
    moq: "MOQ 100 packs",
    inStock: "In stock · 3,200 packs",
    leadTime: "Lead time 2–3 days",
    basePrice: 38,
    baseQty: 100,
    tiers: [
      { range: "100 – 499 packs", price: "₵38 / pack" },
      { range: "500 – 999 packs", price: "₵34 / pack", best: true },
      { range: "1000+ packs", price: "₵30 / pack" },
    ],
  },
  {
    id: "led-bulb-9w",
    name: "LED Bulb 9W",
    manufacturer: "Volta Electricals",
    category: "Electronics",
    rating: 4.8,
    price: "₵14 / unit",
    unit: "unit",
    moq: "MOQ 500 units",
    inStock: "In stock · 6,000 units",
    leadTime: "Lead time 4–6 days",
    basePrice: 14,
    baseQty: 500,
    tiers: [
      { range: "500 – 1999 units", price: "₵14 / unit" },
      { range: "2000 – 4999 units", price: "₵12 / unit", best: true },
      { range: "5000+ units", price: "₵10 / unit" },
    ],
  },
];

export const categories = ["All", "Beverages", "Textiles", "Electronics", "Food & Bev"];

export type Manufacturer = {
  id: string;
  name: string;
  location: string;
  rating: number;
  verified: boolean;
  tagline: string;
};

export const manufacturers: Manufacturer[] = [
  {
    id: "ashanti-agroworks",
    name: "Ashanti AgroWorks",
    location: "Kumasi",
    rating: 4.8,
    verified: true,
    tagline: "Cocoa & agri-processing",
  },
  {
    id: "bonwire-textiles",
    name: "Bonwire Textiles",
    location: "Bonwire",
    rating: 4.7,
    verified: true,
    tagline: "Handwoven Kente fabrics",
  },
  {
    id: "aquapure",
    name: "AquaPure Ltd",
    location: "Tema",
    rating: 4.9,
    verified: true,
    tagline: "Bottled water & beverages",
  },
  {
    id: "volta-electricals",
    name: "Volta Electricals",
    location: "Accra",
    rating: 4.6,
    verified: true,
    tagline: "LED lighting & electricals",
  },
];

export type CartItem = {
  product: Product;
  quantity: number;
};

export const cartItems: CartItem[] = [
  { product: products[0], quantity: 20 },
  { product: products[1], quantity: 50 },
];

export type OrderStatus = "In Transit" | "Processing" | "Delivered";

export type Order = {
  id: string;
  itemsSummary: string;
  total: string;
  status: OrderStatus;
};

export const distributorOrders: Order[] = [
  { id: "#ZYN-1042", itemsSummary: "2 items · Ashanti AgroWorks", total: "₵69,000", status: "In Transit" },
  { id: "#ZYN-1039", itemsSummary: "1 item · Volta Electricals", total: "₵7,000", status: "Processing" },
  { id: "#ZYN-1031", itemsSummary: "3 items · AquaPure Ltd", total: "₵11,400", status: "Delivered" },
];

export type IncomingOrderStatus = "new" | "shipped";

export type IncomingOrder = {
  id: string;
  customer: string;
  location: string;
  summary: string;
  total: string;
  status: IncomingOrderStatus;
};

export const incomingOrders: IncomingOrder[] = [
  {
    id: "#ZYN-1042",
    customer: "Kumasi Distributors",
    location: "Kumasi",
    summary: "20× Cocoa Butter, 50× Kente Roll",
    total: "₵69,000",
    status: "new",
  },
  {
    id: "#ZYN-1040",
    customer: "GoldCoast Wholesale",
    location: "Accra",
    summary: "100× Shea Oil 10L",
    total: "₵42,000",
    status: "shipped",
  },
  {
    id: "#ZYN-1038",
    customer: "Northern Traders",
    location: "Tamale",
    summary: "500× LED Bulb 9W",
    total: "₵7,000",
    status: "shipped",
  },
];

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  units: string;
  low: boolean;
};

export const inventory: InventoryItem[] = [
  { id: "cb-25", name: "Cocoa Butter 25kg", sku: "SKU CB-25 · ₵1,240", units: "18 units", low: true },
  { id: "so-10", name: "Shea Oil 10L", sku: "SKU SO-10 · ₵420", units: "32 units", low: true },
  { id: "pk-20", name: "Palm Kernel Oil 20L", sku: "SKU PK-20 · ₵610", units: "1,420 units", low: false },
  { id: "rc-50", name: "Raw Cashew 50kg", sku: "SKU RC-50 · ₵980", units: "640 units", low: false },
];

export const recentOrders = [
  { id: "#ZYN-1042 · Kumasi Distributors", total: "₵69,000", tag: "NEW" as const },
  { id: "#ZYN-1041 · GoldCoast Wholesale", total: "₵12,400", tag: "SHIPPED" as const },
];

export type NotificationType = "order" | "inventory" | "system" | "promo";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
};

export const notifications: Notification[] = [
  {
    id: "notif-1",
    type: "order",
    title: "Order #ZYN-1042 shipped",
    body: "Ashanti AgroWorks marked your order as shipped. Estimated delivery tomorrow.",
    timestamp: "10 min ago",
    read: false,
  },
  {
    id: "notif-2",
    type: "inventory",
    title: "Low stock alert",
    body: "Cocoa Butter 25kg is down to 18 units — restock soon to avoid missed orders.",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "notif-3",
    type: "order",
    title: "New order received",
    body: "Kumasi Distributors placed a new order worth ₵69,000.",
    timestamp: "5 hours ago",
    read: false,
  },
  {
    id: "notif-4",
    type: "system",
    title: "Business profile verified",
    body: "Your business documents were reviewed and approved. You now carry the Verified badge.",
    timestamp: "Yesterday",
    read: true,
  },
  {
    id: "notif-5",
    type: "promo",
    title: "Reach more distributors",
    body: "List 3 more products this month to appear in Top Manufacturers.",
    timestamp: "2 days ago",
    read: true,
  },
];

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

export const addresses: Address[] = [
  {
    id: "addr-1",
    label: "Warehouse",
    line1: "Suame Magazine, Block C 14",
    city: "Kumasi",
    region: "Ashanti Region",
    phone: "+233 24 123 4567",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Office",
    line1: "12 Liberation Road",
    city: "Accra",
    region: "Greater Accra Region",
    phone: "+233 20 987 6543",
    isDefault: false,
  },
];

export type PaymentMethodType = "card" | "mobile_money";

export type PaymentMethod = {
  id: string;
  type: PaymentMethodType;
  label: string;
  detail: string;
  holderName: string;
  isDefault: boolean;
};

export const paymentMethods: PaymentMethod[] = [
  {
    id: "pm-1",
    type: "mobile_money",
    label: "MTN Mobile Money",
    detail: "•••• 4521",
    holderName: "Kwadwo Mensah",
    isDefault: true,
  },
  {
    id: "pm-2",
    type: "card",
    label: "Visa",
    detail: "•••• 8842 · Exp 09/27",
    holderName: "Kwadwo Mensah",
    isDefault: false,
  },
];

export type BusinessProfile = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  location: string;
  description: string;
};

export const businessProfile: BusinessProfile = {
  fullName: "Kwadwo Mensah",
  companyName: "Kumasi Distributors",
  email: "kwadwo@kumasidistributors.com",
  phone: "+233 24 123 4567",
  location: "Kumasi, Ashanti Region",
  description: "Wholesale distributor serving retailers across the Ashanti Region.",
};
