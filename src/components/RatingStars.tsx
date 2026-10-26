import React from 'react';
import { Text, View } from 'react-native';

export function RatingStars({ value, size = 20 }: { value: number; size?: number }) {
  const score = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Text key={n} style={{ color: n <= Math.round(score) ? '#F5A623' : '#CCC', fontSize: size }}>★</Text>
      ))}
      <Text style={{ marginLeft: 5 }}>{score.toFixed(1)}</Text>
    </View>
  );
}
