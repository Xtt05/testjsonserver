import { api } from '../api/client';
import { Book } from '../types';

async function getAll(): Promise<Book[]> {
  const response = await api.get<Book[]>('/books');
  return response.data;
}

async function getById(id: number): Promise<Book> {
  const response = await api.get<Book>(`/books/${id}`);
  return response.data;
}

async function getRelated(book: Book, limit = 10): Promise<Book[]> {
  const response = await api.get<Book[]>('/books', {
    params: { category: book.category, id_ne: book.id, _limit: limit }
  });
  return response.data;
}

export default { getAll, getById, getRelated };
