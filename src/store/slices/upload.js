import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const uploadImage = createAsyncThunk(
  "image/upload",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await api.post(`/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data.fileUrl || data.url || data.image || "";
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const imageUploadSlice = createSlice({
  name: "imageUpload",
  initialState: { url: "", loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.loading = false;
        state.url = action.payload;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default imageUploadSlice.reducer;
