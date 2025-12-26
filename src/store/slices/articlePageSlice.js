import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { toast } from "react-toastify";

export const getArticlePage = createAsyncThunk("article/get", async () => {
  const res = await api.get(`/article-page`);
  return res.data.data;
});

export const updateArticlePage = createAsyncThunk(
  "article/update",
  async (body) => {
    const res = await api.put(`/article-page/update`, body);
    //  toast.success(res.data?.message || "About page updated successfully");
    return res.data.data;
  }
);

const articleSlice = createSlice({
  name: "articlePage",
  initialState: { articlePage: null, loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(getArticlePage.pending, (state) => {
        state.loading = true;
      })
      .addCase(getArticlePage.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.articlePage = payload;
      })
      .addCase(updateArticlePage.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.articlePage = payload;
      })
      .addCase(updateArticlePage.pending, (state) => {
        state.loading = true;
      });
  },
});

export default articleSlice.reducer;
