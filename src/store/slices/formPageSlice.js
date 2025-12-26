import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { toast } from "react-toastify";

export const getFormPage = createAsyncThunk("form/get", async () => {
  const res = await api.get(`/form-page`);
  return res.data.data;
});

export const updateFormPage = createAsyncThunk("form/update", async (body) => {
  const res = await api.put(`/form-page/update`, body);
  //  toast.success(res.data?.message || "About page updated successfully");
  return res.data.data;
});

const formPageSlice = createSlice({
  name: "formPage",
  initialState: { formPage: null, loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(getFormPage.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFormPage.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.formPage = payload;
      })
      .addCase(updateFormPage.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.formPage = payload;
      })
      .addCase(updateFormPage.pending, (state) => {
        state.loading = true;
      });
  },
});

export default formPageSlice.reducer;
