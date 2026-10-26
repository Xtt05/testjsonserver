export type Id = number;

export type User = {
  id: Id;
  name: string;
  email: string;
};

export type Book = {
  id: Id;
  title: string;
  author: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
};

export type Review = {
  id: Id;
  bookId: Id;
  userId: Id;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};
