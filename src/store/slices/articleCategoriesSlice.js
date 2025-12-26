import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { toast } from "react-toastify";

export const getCategories = createAsyncThunk(
  "categories/getCategories",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/article-categories`, {
        params: { page, limit, search },
      });
      return response.data; // contains data + pagination info
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const getCategoriesAll = createAsyncThunk(
  "categories/getCategoriesAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/article-categories/all`);
      return response.data; // contains data + pagination info
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const getCategoryById = createAsyncThunk(
  "categories/getCategoryById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/article-categories/details/${id}`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/article-categories/update/${id}`,
        categoryData
      );
      toast.success(response?.data?.message || "Category updated successfully");
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/article-categories/create`,
        categoryData
      );
      toast.success(response?.data?.message || "Category created successfully");
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const deleteArticleCategory = createAsyncThunk(
  "categories/deleteArticleCategory",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/article-categories/delete/${id}`);
      toast.success(res.data.message || "Category deleted successfully!");
      return id;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
      return rejectWithValue(err.response?.data?.message);
    }
  }
);
const categorySlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    categoriesAll: [],
    selectedCategory: null,
    loading: false,
    error: null,
    pagination: { total: 0, page: 1, pages: 1, limit: 10 },
  },
  reducers: {
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setCategoriesAll: (state, action) => {
      state.categoriesAll = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCategoriesAll.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCategoriesAll.fulfilled, (state, action) => {
        state.loading = false;
        state.categoriesAll = action.payload.data;
      })
      .addCase(getCategoriesAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCategoryById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(getCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;

        const updatedCategory = action.payload;
        const index = state.categories.findIndex(
          (c) => c._id === updatedCategory._id
        );

        if (index !== -1) {
          state.categories[index] = updatedCategory;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteArticleCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteArticleCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(
          (c) => c._id !== action.payload
        );
      })
      .addCase(deleteArticleCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const {
  clearSelectedCategory,
  clearError,
  setCategories,
  setCategoriesAll,
} = categorySlice.actions;

export default categorySlice.reducer;
