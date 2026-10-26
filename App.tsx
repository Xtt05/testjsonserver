import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import authService, { AuthResult } from './src/services/authService';
import bookService from './src/services/bookService';
import reviewService from './src/services/reviewService';
import { setAuthToken } from './src/api/client';
import { Book, Review } from './src/types';

const STORAGE_KEY = 'bookstore_auth_session';

export default function App() {
  const [session, setSession] = useState<AuthResult | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [registerMode, setRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('test@gmail.com');
  const [password, setPassword] = useState('123456');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved: AuthResult = JSON.parse(raw);
        if (!saved.token || saved.expiresAt <= Date.now()) {
          await AsyncStorage.removeItem(STORAGE_KEY);
          return;
        }
        setAuthToken(saved.token);
        setSession(saved);
        await loadBooks();
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    })();
  }, []);

  async function loadBooks() {
    setLoading(true);
    setError('');
    try {
      setBooks(await bookService.getAll());
    } catch {
      setError('Không tải được sách. Kiểm tra IP và JSON Server.');
    } finally {
      setLoading(false);
    }
  }

  async function authenticate() {
    if (!email.trim() || !password) {
      setError('Nhập email và mật khẩu.');
      return;
    }
    if (registerMode && (!name.trim() || password.length < 6)) {
      setError('Nhập họ tên và mật khẩu tối thiểu 6 ký tự.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = registerMode
        ? await authService.register(name, email, password)
        : await authService.login(email, password);
      setAuthToken(result.token);
      setSession(result);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      await loadBooks();
    } catch (e: any) {
      setError(e?.message || 'Không thể đăng nhập.');
    } finally {
      setLoading(false);
    }
  }

  async function openBook(item: Book) {
    setBook(item);
    setLoading(true);
    setError('');
    try {
      setReviews(await reviewService.getByBook(item.id));
    } catch {
      setError('Không tải được review.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  async function submitReview() {
    if (!session || !book) return setError('Đăng nhập để viết đánh giá.');
    const score = Number(rating);
    if (!Number.isInteger(score) || score < 1 || score > 5) return setError('Điểm phải từ 1 đến 5.');
    if (!comment.trim()) return setError('Nhập nội dung đánh giá.');
    setLoading(true);
    setError('');
    try {
      const created = await reviewService.create({
        bookId: book.id,
        userId: session.user.id,
        userName: session.user.name,
        rating: score,
        comment: comment.trim()
      });
      setReviews(previous => [created, ...previous]);
      setComment('');
    } catch (e: any) {
      setError(e?.response?.data || e?.message || 'Không gửi được review.');
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    setSession(null);
    setBook(null);
    setReviews([]);
    setError('');
  }

  const button = (label: string, action: () => void, light = false) => (
    <TouchableOpacity style={[styles.button, light && styles.lightButton]} onPress={action} disabled={loading}>
      <Text style={[styles.buttonText, light && styles.lightText]}>{label}</Text>
    </TouchableOpacity>
  );

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.auth}>
          <Text style={styles.title}>BookStore</Text>
          <Text style={styles.subtitle}>{registerMode ? 'Đăng ký tài khoản' : 'Đăng nhập'}</Text>
          {registerMode && <TextInput style={styles.input} placeholder="Họ tên" value={name} onChangeText={setName} />}
          <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Mật khẩu" secureTextEntry value={password} onChangeText={setPassword} />
          {!!error && <Text style={styles.error}>{error}</Text>}
          {loading && <ActivityIndicator />}
          {button(registerMode ? 'Đăng ký' : 'Đăng nhập', authenticate)}
          {button(registerMode ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký', () => { setRegisterMode(!registerMode); setError(''); }, true)}
          
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (book) {
    const avg = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.content}>
          {button('← Danh sách sách', () => { setBook(null); setError(''); }, true)}
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.subtitle}>{book.author}</Text>
          <Text style={styles.text}>Thể loại: {book.category}</Text>
          <Text style={styles.text}>Giá: {Number(book.price || 0).toLocaleString('vi-VN')} đ</Text>
          {!!book.description && <Text style={styles.text}>{book.description}</Text>}
          <View style={styles.divider} />
          <Text style={styles.section}>Đánh giá · {avg.toFixed(1)}/5 · {reviews.length} lượt</Text>
          <TextInput style={styles.input} placeholder="Điểm từ 1 đến 5" keyboardType="number-pad" value={rating} onChangeText={setRating} />
          <TextInput style={[styles.input, styles.multiline]} placeholder="Nội dung review" multiline value={comment} onChangeText={setComment} />
          {button('Gửi đánh giá', submitReview)}
          {!!error && <Text style={styles.error}>{error}</Text>}
          {loading && <ActivityIndicator />}
          {reviews.map(r => (
            <View key={String(r.id)} style={styles.card}>
              <Text style={styles.cardTitle}>{r.userName} · {r.rating}/5</Text>
              <Text style={styles.text}>{r.comment}</Text>
              <Text style={styles.hint}>{r.createdAt}</Text>
            </View>
          ))}
          {button('Đăng xuất', logout, true)}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Danh sách sách</Text>
        {button('Tải lại', loadBooks, true)}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {loading && <ActivityIndicator size="large" />}
      <FlatList
        data={books}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.content}
        ListEmptyComponent={<Text style={styles.text}>Không có sách hoặc API chưa kết nối.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openBook(item)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.text}>{item.author}</Text>
            <Text style={styles.text}>{item.category} · {Number(item.price || 0).toLocaleString('vi-VN')} đ</Text>
          </TouchableOpacity>
        )}
      />
      {button('Đăng xuất', logout, true)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8fb' },
  auth: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  content: { padding: 16, gap: 10 },
  header: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 26, fontWeight: '700', color: '#182230', marginBottom: 8 },
  subtitle: { fontSize: 17, color: '#596579', marginBottom: 16 },
  section: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d0d7e2', borderRadius: 10, padding: 13, marginBottom: 10, color: '#182230' },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  button: { backgroundColor: '#225fe5', padding: 14, borderRadius: 10, alignItems: 'center', marginVertical: 5 },
  buttonText: { color: '#fff', fontWeight: '700' },
  lightButton: { backgroundColor: '#e7edf7' },
  lightText: { color: '#26364d' },
  error: { color: '#b42318', marginVertical: 8, paddingHorizontal: 16 },
  hint: { color: '#687587', fontSize: 12, marginTop: 5 },
  text: { color: '#344054', fontSize: 15, marginVertical: 3 },
  divider: { height: 1, backgroundColor: '#d0d7e2', marginVertical: 12 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e0e6ef', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#182230', marginBottom: 4 }
});
