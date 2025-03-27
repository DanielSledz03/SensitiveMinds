import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    resetToken(state) {
      state.token = null;
    },
  },
});

export const {setToken, resetToken} = authSlice.actions;
export default authSlice.reducer;
