import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Image, ScrollView, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootStackParamList, Book, Review } from '../types';
import { RootState } from '../store';
import { bookService, reviewService } from '../services';
import { RatingStars } from '../components/RatingStars';
import { BookCard } from '../components/BookCard';

type Props = NativeStackScreenProps<RootStackParamList, 'BookDetail'>;

export function BookDetailScreen({ route, navigation }: Props) {
  const { book } = route.params;
  const user = useSelector((s: RootState) => s.auth.user);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Book[]>([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([reviewService.getByBook(book.id), bookService.getBooks()])
      .then(([rs, books]) => {
        setReviews(rs);
        setRelated(books.filter(b => b.id !== book.id && b.category === book.category));
      })
      .catch(() => Alert.alert('Lỗi', 'Không tải được review hoặc sách liên quan.'))
      .finally(() => setLoading(false));
  }, [book.id, book.category]);

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  async function sendReview() {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Lỗi', 'Nhập bình luận trước khi gửi.');
      return;
    }
    setSending(true);
    try {
      const newReview = await reviewService.create({
        bookId: book.id, userId: user.id, userName: user.name,
        rating, comment: comment.trim(),
      });
      setReviews(old => [...old, newReview]);
      setComment('');
      setRating(5);
      Alert.alert('Thành công', 'Đã thêm đánh giá.');
    } catch (e) {
      Alert.alert('Lỗi', e instanceof Error ? e.message : 'Gửi review thất bại');
    } finally { setSending(false); }
  }

  return <ScrollView style={{ flex: 1, padding: 12 }}>
    {book.thumbnail ? <Image source={{ uri: book.thumbnail }} style={{ width: '100%', height: 190 }} resizeMode="contain" /> : null}
    <Text style={{ fontSize: 22, fontWeight: 'bold', marginVertical: 8 }}>{book.title}</Text>
    <Text>Danh mục: {book.category}</Text>
    <Text style={{ color: 'red', fontSize: 18, marginVertical: 6 }}>${book.price.toFixed(2)}</Text>
    <Text>{book.description}</Text>
    <Button title="Mua / Thanh toán" onPress={() => navigation.navigate('Checkout')} />

    <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 18 }}>Đánh giá</Text>
    <RatingStars value={average} size={22} />
    <Text>Trung bình {average.toFixed(1)} / 5 ({reviews.length} review)</Text>
    {loading ? <ActivityIndicator /> : reviews.length === 0 ? <Text>Chưa có đánh giá.</Text> : reviews.map(r => (
      <View key={r.id} style={{ padding: 10, backgroundColor: '#F1F5F9', marginVertical: 5, borderRadius: 6 }}>
        <Text style={{ fontWeight: 'bold' }}>{r.userName}</Text>
        <RatingStars value={r.rating} size={16} />
        <Text>{r.comment}</Text>
      </View>
    ))}

    <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 16 }}>Viết review</Text>
    {user ? <>
      <Text>Chấm sao: {rating}</Text>
      <View style={{ flexDirection: 'row' }}>
        {[1, 2, 3, 4, 5].map(n => <Text key={n} onPress={() => setRating(n)} style={{ fontSize: 28, color: n <= rating ? 'orange' : '#CCC' }}>★ </Text>)}
      </View>
      <TextInput value={comment} onChangeText={setComment} placeholder="Bình luận..." multiline style={{ borderWidth: 1, borderColor: '#AAA', padding: 10, marginVertical: 8, minHeight: 65 }} />
      <Button title={sending ? 'Đang gửi...' : 'Gửi review'} disabled={sending} onPress={sendReview} />
    </> : <Button title="Đăng nhập để đánh giá" onPress={() => navigation.navigate('Login')} />}

    <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 18 }}>Sách liên quan</Text>
    <FlatList horizontal data={related} keyExtractor={b => b.id} renderItem={({ item }) => (
      <BookCard book={item} horizontal onPress={() => navigation.push('BookDetail', { book: item })} />
    )} ListEmptyComponent={<Text>Không có sách cùng danh mục.</Text>} />
  </ScrollView>;
}
