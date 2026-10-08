import { configureStore } from '@reduxjs/toolkit';
import userReducer from './components/userSlice';

export const store = configureStore({
  reducer: {
    // Add your reducers here
    user: userReducer,
  },
});