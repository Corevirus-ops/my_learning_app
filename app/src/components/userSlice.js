import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (token, thunkAPI) => {
   
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export { fetchUser };  
export default userSlice.reducer;