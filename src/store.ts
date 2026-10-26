import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Session } from './types';

type AuthState = { user: Session['user'] | null; token: string | null; hydrated: boolean };
const initialState: AuthState = { user: null, token: null, hydrated: false };

const authSlice = createSlice({
  name: 'auth', initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<Session>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: state => { state.user = null; state.token = null; },
    setHydrated: state => { state.hydrated = true; },
  },
});

export const { setAuth, logout, setHydrated } = authSlice.actions;
export const store = configureStore({ reducer: { auth: authSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
