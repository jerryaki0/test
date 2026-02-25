export type RequestStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ResponseStatus = 'pending' | 'accepted' | 'rejected';
export type Urgency = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  phone?: string;
  rating: number;
  helpCount: number;
  points: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface HelpRequest {
  id: number;
  userId: string;
  title: string;
  description: string;
  categoryId?: number;
  urgency: Urgency;
  status: RequestStatus;
  location?: string;
  rewardPoints: number;
  images?: string[];
  viewCount: number;
  responseCount: number;
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
  user?: User;
  users?: User; // 关联查询返回的别名字段
  category?: Category;
  categories?: Category; // 关联查询返回的别名字段
}

export interface HelpResponse {
  id: number;
  requestId: number;
  userId: string;
  message: string;
  status: ResponseStatus;
  createdAt: string;
  updatedAt?: string;
  user?: User;
  users?: User; // 关联查询返回的别名字段
}

export interface Review {
  id: number;
  requestId: number;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer?: User;
  reviewee?: User;
}

export interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: User;
  receiver?: User;
}
