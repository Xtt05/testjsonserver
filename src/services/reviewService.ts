import { api } from '../api/client';
import { Review } from '../types';

export type NewReview = Omit<Review, 'id' | 'createdAt'>;

async function getByBook(bookId: number): Promise<Review[]> {
  const response = await api.get<Review[]>('/reviews', {
    params: { bookId, _sort: 'createdAt', _order: 'desc' }
  });
  return response.data;
}

async function create(input: NewReview): Promise<Review> {
  const response = await api.post<Review>('/reviews', {
    ...input,
    createdAt: new Date().toISOString()
  });
  return response.data;
}

export default { getByBook, create };
