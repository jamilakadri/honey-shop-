// src/app/models/cart.model.ts

export interface Cart {
  cartId: number;
  userId: number;
  cartItems: CartItem[]; 
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  price: number;
  product: CartProduct;
  addedAt: Date;
}

export interface CartProduct {
  productId: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  stockQuantity: number;
  weight?: number;
  origin?: string;
  productImages: ProductImage[];
}

export interface ProductImage {
  productImageId: number;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}