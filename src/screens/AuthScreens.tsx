import React, { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { RootStackParamList } from '../types';
import { AppDispatch, setAuth } from '../store';
import { authService } from '../services';

type LoginProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
type RegisterProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
const emailOK = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const inputStyle = { borderWidth: 1, borderColor: '#AAA', padding: 10, marginVertical: 5, borderRadius: 5 } as const;

export function LoginScreen({ navigation, route }: LoginProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(''); const [passError, setPassError] = useState('');
  const returnTo = route.params?.returnTo ?? 'Home';

  async function submit() {
    setEmailError(emailOK(email.trim()) ? '' : 'Email không đúng định dạng');
    setPassError(password.length >= 6 ? '' : 'Mật khẩu tối thiểu 6 ký tự');
    if (!emailOK(email.trim()) || password.length < 6) return;
    try {
      const session = await authService.login(email, password);
      dispatch(setAuth(session));
      if (returnTo === 'Checkout') navigation.replace('Checkout');
      else navigation.replace('Home');
    } catch (e) { Alert.alert('Đăng nhập lỗi', e instanceof Error ? e.message : 'Thử lại'); }
  }

  return <View style={{ padding: 20 }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Đăng nhập</Text>
    <TextInput style={inputStyle} value={email} placeholder="Email" autoCapitalize="none" keyboardType="email-address" onChangeText={v => { setEmail(v); setEmailError(v && !emailOK(v) ? 'Email không đúng định dạng' : ''); }} />
    {!!emailError && <Text style={{ color: 'red' }}>{emailError}</Text>}
    <TextInput style={inputStyle} value={password} placeholder="Mật khẩu (tối thiểu 6 ký tự)" secureTextEntry onChangeText={v => { setPassword(v); setPassError(v && v.length < 6 ? 'Mật khẩu tối thiểu 6 ký tự' : ''); }} />
    {!!passError && <Text style={{ color: 'red' }}>{passError}</Text>}
    <Button title="Đăng nhập" onPress={submit} />
    <Button title="Chưa có tài khoản? Đăng ký" onPress={() => navigation.navigate('Register', { returnTo })} />
  </View>;
}

export function RegisterScreen({ navigation, route }: RegisterProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(''); const [passError, setPassError] = useState('');
  const returnTo = route.params?.returnTo ?? 'Home';

  async function submit() {
    setEmailError(emailOK(email.trim()) ? '' : 'Email không đúng định dạng');
    setPassError(password.length >= 6 ? '' : 'Mật khẩu tối thiểu 6 ký tự');
    if (!name.trim() || !emailOK(email.trim()) || password.length < 6) {
      if (!name.trim()) Alert.alert('Lỗi', 'Nhập họ tên');
      return;
    }
    try {
      const session = await authService.register(name, email, password);
      dispatch(setAuth(session));
      if (returnTo === 'Checkout') navigation.replace('Checkout');
      else navigation.replace('Home');
    } catch (e) { Alert.alert('Đăng ký lỗi', e instanceof Error ? e.message : 'Thử lại'); }
  }

  return <View style={{ padding: 20 }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Đăng ký</Text>
    <TextInput style={inputStyle} value={name} placeholder="Họ tên" onChangeText={setName} />
    <TextInput style={inputStyle} value={email} placeholder="Email" autoCapitalize="none" keyboardType="email-address" onChangeText={v => { setEmail(v); setEmailError(v && !emailOK(v) ? 'Email không đúng định dạng' : ''); }} />
    {!!emailError && <Text style={{ color: 'red' }}>{emailError}</Text>}
    <TextInput style={inputStyle} value={password} placeholder="Mật khẩu (tối thiểu 6 ký tự)" secureTextEntry onChangeText={v => { setPassword(v); setPassError(v && v.length < 6 ? 'Mật khẩu tối thiểu 6 ký tự' : ''); }} />
    {!!passError && <Text style={{ color: 'red' }}>{passError}</Text>}
    <Button title="Tạo tài khoản" onPress={submit} />
    <Button title="Đã có tài khoản? Đăng nhập" onPress={() => navigation.navigate('Login', { returnTo })} />
  </View>;
}
