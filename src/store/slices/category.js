import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { toast } from "react-toastify";

export const getCategories = createAsyncThunk(
  "category/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`/category`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post(`/category/create`, formData);
      // toast.success(res.data.message || "Category created successfully!");
      return res.data;
    } catch (err) {
      // toast.error(err.response?.data?.message || "Failed to create category");
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/category/update?id=${id}`, formData);
      // toast.success(res.data.message || "Category updated successfully!");
      return res.data;
    } catch (err) {
      // toast.error(err.response?.data?.message || "Failed to update category");
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/category/delete?id=${id}`);
      toast.success(res.data.message || "Category deleted successfully!");
      return id;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload.data);
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
