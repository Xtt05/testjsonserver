import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Text, View, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootStackParamList } from '../types';
import { RootState } from '../store';
import { bookService } from '../services';
import { BookCard } from '../components/BookCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const user = useSelector((s: RootState) => s.auth.user);
  const [books, setBooks] = useState<import('../types').Book[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { setBooks(await bookService.getBooks()); }
    catch { Alert.alert('Lỗi', 'Không tải được sách. Kiểm tra resource Book trên MockAPI.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={{ fontSize: 23, fontWeight: 'bold', marginBottom: 8 }}>Book Store</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }}>
        <Button title={user ? 'Tài khoản' : 'Đăng nhập'} onPress={() => { if (user) navigation.navigate('Account'); else navigation.navigate('Login'); }} />
        <Button title="Thanh toán" onPress={() => navigation.navigate('Checkout')} />
      </View>
      <FlatList
        data={books} numColumns={2} keyExtractor={b => b.id}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ListEmptyComponent={<Text>Resource Book chưa có dữ liệu.</Text>}
        renderItem={({ item }) => <BookCard book={item} onPress={() => navigation.navigate('BookDetail', { book: item })} />}
      />
    </View>
  );
}
