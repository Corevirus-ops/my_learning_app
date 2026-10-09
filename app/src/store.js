import { configureStore } from '@reduxjs/toolkit';
import userReducer from './components/userSlice';
import courseReducer from './components/courseSlice';

export const store = configureStore({
  reducer: {
    // Add your reducers here
    user: userReducer,
    courses: courseReducer,
  },
});