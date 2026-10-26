import { api, getServerMessage } from '../api/client';
import { User } from '../types';

export type AuthResult = { token: string; user: User; expiresAt: number };
type AuthResponse = { accessToken: string; user: User & { password?: string } };

function getJwtExpiry(token: string): number {
  try {
    const payloadPart = token.split('.')[1];
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)).exp * 1000;
  } catch {
    return Date.now() + 60 * 60 * 1000;
  }
}

function toPublicUser(user: User & { password?: string }): User {
  const { password, ...publicUser } = user;
  return publicUser;
}

function toResult(data: AuthResponse): AuthResult {
  return { token: data.accessToken, user: toPublicUser(data.user), expiresAt: getJwtExpiry(data.accessToken) };
}

function toAppError(err: unknown): Error {
  const message = getServerMessage(err);
  const messages: Record<string, string> = {
    'Cannot find user': 'Email hoặc mật khẩu không đúng',
    'Incorrect password': 'Email hoặc mật khẩu không đúng',
    'Email already exists': 'Email đã được sử dụng',
    'Email format is invalid': 'Email không đúng định dạng',
    'Password is too short': 'Mật khẩu phải có ít nhất 6 ký tự'
  };
  if (message) return new Error(messages[message] ?? message);
  return new Error('Không kết nối được máy chủ. Kiểm tra IP và JSON Server.');
}

async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const response = await api.post<AuthResponse>('/login', { email: email.trim().toLowerCase(), password });
    return toResult(response.data);
  } catch (err) {
    throw toAppError(err);
  }
}

async function register(name: string, email: string, password: string): Promise<AuthResult> {
  try {
    const response = await api.post<AuthResponse>('/register', { name: name.trim(), email: email.trim().toLowerCase(), password });
    return toResult(response.data);
  } catch (err) {
    throw toAppError(err);
  }
}

async function getMe(userId: number): Promise<User> {
  const response = await api.get<User & { password?: string }>(`/users/${userId}`);
  return toPublicUser(response.data);
}

export default { login, register, getMe };
