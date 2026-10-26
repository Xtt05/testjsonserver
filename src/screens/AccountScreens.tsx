import React, { useEffect } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../types';
import { AppDispatch, logout, RootState } from '../store';
import { authService } from '../services';

type AccountProps = NativeStackScreenProps<RootStackParamList, 'Account'>;
type CheckoutProps = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function AccountScreen({ navigation }: AccountProps) {
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => { if (!user) navigation.replace('Login'); }, [user, navigation]);
  if (!user) return <View />;

  async function signOut() {
    await authService.logout();
    dispatch(logout());
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  return <View style={{ padding: 20 }}>
    <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Tài khoản</Text>
    <Text>Họ tên: {user.name}</Text>
    <Text>Email: {user.email}</Text>
    <Button title="Thanh toán" onPress={() => navigation.navigate('Checkout')} />
    <Button title="Đăng xuất" onPress={signOut} color="red" />
  </View>;
}

export function CheckoutScreen({ navigation }: CheckoutProps) {
  const user = useSelector((s: RootState) => s.auth.user);

  useEffect(() => {
    if (!user) navigation.replace('Login', { returnTo: 'Checkout' });
  }, [user, navigation]);

  if (!user) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Chuyển đến đăng nhập...</Text></View>;

  return <View style={{ padding: 20 }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Checkout</Text>
    <Text>Người mua: {user.name}</Text>
    <Button title="Xác nhận thanh toán" onPress={() => Alert.alert('Thành công', 'Thanh toán demo')} />
  </View>;
}
