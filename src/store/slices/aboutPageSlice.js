import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { toast } from "react-toastify";

export const getAboutPage = createAsyncThunk("about/get", async () => {
  const res = await api.get(`/about`);
  return res.data.data;
});

export const updateAboutPage = createAsyncThunk(
  "about/update",
  async (body) => {
    const res = await api.put(`/about/update`, body);
    //  toast.success(res.data?.message || "About page updated successfully");
    return res.data.data;
  }
);

const aboutSlice = createSlice({
  name: "about",
  initialState: { about: null, loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(getAboutPage.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAboutPage.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.about = payload;
      })
      .addCase(updateAboutPage.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.about = payload;
      })
      .addCase(updateAboutPage.pending, (state) => {
        state.loading = true;
      });
  },
});

export default aboutSlice.reducer;
