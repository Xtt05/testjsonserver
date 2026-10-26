import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account, Book, Review, Session, User } from './types';

// Endpoint đúng theo project MockAPI trong ảnh; resource phân biệt chữ hoa/thường.
const BASE_URL = 'https://6acc70bcb406cb8ec0c5ac8b.mockapi.io';
export const BOOKS_API = `${BASE_URL}/Book`;
export const REVIEWS_API = `${BASE_URL}/reviews`;
const USERS_KEY = '@week7_users';
const SESSION_KEY = '@week7_session';

function normalizeBook(b: any): Book {
  return {
    id: String(b.id), title: String(b.title ?? 'Sách chưa có tên'),
    description: String(b.description ?? ''), price: Number(b.price) || 0,
    thumbnail: String(b.thumbnail ?? ''), category: String(b.category ?? 'Khác'),
    rating: Math.max(0, Math.min(5, Number(b.rating) || 0)),
  };
}

export const bookService = {
  async getBooks(): Promise<Book[]> {
    const res = await fetch(BOOKS_API);
    if (!res.ok) throw new Error('Không tải được sách từ MockAPI');
    const data = await res.json();
    return Array.isArray(data) ? data.map(normalizeBook) : [];
  },
};

export const reviewService = {
  async getByBook(bookId: string): Promise<Review[]> {
    const res = await fetch(`${REVIEWS_API}?bookId=${encodeURIComponent(bookId)}`);
    if (!res.ok) throw new Error('Không tải được review');
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((r: any) => ({
      id: String(r.id), bookId: String(r.bookId), userId: String(r.userId),
      userName: String(r.userName ?? 'Người dùng'),
      rating: Math.max(1, Math.min(5, Number(r.rating) || 1)),
      comment: String(r.comment ?? ''),
    }));
  },
  async create(review: Omit<Review, 'id'>): Promise<Review> {
    const res = await fetch(REVIEWS_API, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (!res.ok) throw new Error('Gửi review thất bại');
    const r = await res.json();
    return { ...review, id: String(r.id) };
  },
};

async function createSession(account: Account): Promise<Session> {
  const user: User = { id: account.id, name: account.name, email: account.email };
  // Token mô phỏng cho bài thực hành; backend thật phải tự cấp token.
  const session = { user, token: `demo-${Date.now()}` };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<Session> {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users: Account[] = raw ? JSON.parse(raw) : [];
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email đã được đăng ký');
    }
    const account: Account = { id: String(Date.now()), name: name.trim(), email: email.trim(), password };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, account]));
    return createSession(account);
  },
  async login(email: string, password: string): Promise<Session> {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users: Account[] = raw ? JSON.parse(raw) : [];
    const account = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (!account) throw new Error('Email hoặc mật khẩu không đúng. Hãy đăng ký trước.');
    return createSession(account);
  },
  async getSession(): Promise<Session | null> {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    return session?.token && session?.user ? session : null;
  },
  async logout() { await AsyncStorage.removeItem(SESSION_KEY); },
};

export const getSession = () => authService.getSession();
