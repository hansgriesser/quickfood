export interface ForumThreadListItem {
  id: number;
  title: string;
  content: string;
  isClosed: boolean;
  createdAt: string;
  restaurantId: string;
  author: { id: number; username: string };
  _count: { post: number };
}

export interface ForumThreadDetail {
  id: number;
  title: string;
  content: string;
  isClosed: boolean;
  createdAt: string;
  restaurantId: string;
  author: { id: number; username: string };
  restaurant: { id: string; name: string; ownerId: number };
  post: ForumPost[];
}

export interface ForumPost {
  id: number;
  content: string;
  createdAt: string;
  author: { id: number; username: string };
}
