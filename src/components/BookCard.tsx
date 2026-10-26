import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Book } from '../types';
import { RatingStars } from './RatingStars';

export function BookCard({ book, onPress, horizontal = false }: {
  book: Book; onPress: () => void; horizontal?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={{ width: horizontal ? 145 : '48%', padding: 10, marginBottom: 10, marginRight: horizontal ? 10 : 0, backgroundColor: '#FFF', borderRadius: 8 }}>
      {book.thumbnail ? <Image source={{ uri: book.thumbnail }} style={{ width: '100%', height: 105 }} resizeMode="contain" /> : <View style={{ height: 105, justifyContent: 'center' }}><Text>Không có ảnh</Text></View>}
      <Text numberOfLines={2} style={{ fontWeight: 'bold', marginVertical: 4 }}>{book.title}</Text>
      <Text>${book.price.toFixed(2)}</Text>
      <RatingStars value={book.rating} size={13} />
    </Pressable>
  );
}
