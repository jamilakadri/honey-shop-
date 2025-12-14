export interface Order {
  orderId: number;
  orderNumber: string;
  userId: number;
  subTotal: number;
  shippingCost: number;
  tax: number;
  discountAmount: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  notes?: string;
  orderDate: string;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrderRequest {
  shippingAddressId: number;
  billingAddressId: number;
  promoCode?: string;
  notes?: string;
}
