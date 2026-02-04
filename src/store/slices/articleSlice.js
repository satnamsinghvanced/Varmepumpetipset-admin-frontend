import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

const IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE;

const fixImageUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  return url.startsWith("http") ? url : `${IMAGE_URL}${url}`;
};

export const getArticles = createAsyncThunk(
  "articles/getArticles",
  async ({ page = 1, limit = 10, search = "" } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/article?page=${page}&limit=${limit}&search=${search}`
      );
      return {
        data: res.data.data,
        pagination: res.data.pagination,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getArticleById = createAsyncThunk(
  "articles/getArticleById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/article/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createArticle = createAsyncThunk(
  "articles/createArticle",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post(`/article/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateArticle = createAsyncThunk(
  "articles/updateArticle",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/article/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteArticle = createAsyncThunk(
  "articles/deleteArticle",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/article/delete/${id}`);
      return {
        id,
        message: res?.data?.message || "Article deleted successfully",
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const articleSlice = createSlice({
  name: "articles",
  initialState: {
    articles: { data: [], pagination: {} },
    selectedArticle: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedArticle: (state) => {
      state.selectedArticle = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setArticles: (state, action) => {
      state.articles = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getArticles.pending, (state) => {
        state.loading = true;
      })
      .addCase(getArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(getArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getArticleById.fulfilled, (state, action) => {
        state.selectedArticle = action.payload;
      })

      .addCase(createArticle.fulfilled, (state, action) => {
        state.articles.data.push(action.payload);
      })

      .addCase(updateArticle.fulfilled, (state, action) => {
        const i = state.articles.data.findIndex(
          (a) => a._id === action.payload._id
        );
        if (i !== -1) state.articles.data[i] = action.payload;
      })

      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.articles.data = state.articles.data.filter(
          (a) => a._id !== action.payload.id
        );
      });
  },
});

export const { clearSelectedArticle, clearError, setArticles } =
  articleSlice.actions;
export default articleSlice.reducer;
