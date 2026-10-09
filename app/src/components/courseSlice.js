import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { listCourses } from '../services/courseService';

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue, signal }) => {
    try {
      return await listCourses({ signal });
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
      return rejectWithValue(error.message || 'Could not connect to the server.');
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    status: 'idle',
    error: null,
    currentRequestId: null,
  },
  reducers: {
    addCourse: (state, action) => {
      state.courses.push(action.payload);
    },
    removeCourse: (state, action) => {
      state.courses = state.courses.filter(course => course.id !== action.payload);
    },
    updateCourse: (state, action) => {
      const index = state.courses.findIndex(course => course.id === action.payload.id);
      if (index !== -1) {
        state.courses[index] = action.payload;
      }
    },
    clearCourses: (state) => {
      state.courses = [];
      state.status = 'idle';
      state.error = null;
      state.currentRequestId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.courses = action.payload;
        state.status = 'succeeded';
        state.currentRequestId = null;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.status = action.meta.aborted ? 'idle' : 'failed';
        state.error = action.meta.aborted ? null : action.payload || action.error.message;
        state.currentRequestId = null;
      });
  }
});

export default courseSlice.reducer;
export const { addCourse, removeCourse, updateCourse, clearCourses } = courseSlice.actions;
