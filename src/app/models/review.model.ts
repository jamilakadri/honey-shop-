import { User } from "./user.model";

export interface Review {
  reviewId: number;
  productId: number;
  userId: number;
  rating: number;
  title?: string;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
  user?: User;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  comment?: string;
}