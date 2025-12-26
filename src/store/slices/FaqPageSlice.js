import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { toast } from "react-toastify";

export const getFaqPage = createAsyncThunk("faq/get", async () => {
  const res = await api.get(`/faq-page`);
  return res.data.data;
});

export const updateFaqPage = createAsyncThunk("faq/update", async (body) => {
  const res = await api.put(`/faq-page/update`, body);
  //  toast.success(res.data?.message || "About page updated successfully");
  return res.data.data;
});

const faqSlice = createSlice({
  name: "faqPage",
  initialState: { faqPage: null, loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(getFaqPage.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFaqPage.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.faqPage = payload;
      })
      .addCase(updateFaqPage.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.faqPage = payload;
      })
      .addCase(updateFaqPage.pending, (state) => {
        state.loading = true;
      });
  },
});

export default faqSlice.reducer;
