import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { toast } from "react-toastify";
export const getFAQs = createAsyncThunk(
  "faq/getFAQs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`/faq`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch FAQs"
      );
    }
  }
);

export const createFAQ = createAsyncThunk(
  "faq/createFAQ",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post(`/faq/create`, formData);
      toast.success(res.data.message || "FAQ created successfully!");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create FAQ");
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateFAQ = createAsyncThunk(
  "faq/updateFAQ",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/faq/update?id=${id}`, formData);
      toast.success(res.data.message || "FAQ updated successfully!");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update FAQ");
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const deleteFAQ = createAsyncThunk(
  "faq/deleteFAQ",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/faq/delete?id=${id}`);
      toast.success(res.data.message || "FAQ deleted successfully!");
      return id;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete FAQ");
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const faqSlice = createSlice({
  name: "faq",
  initialState: {
    faqs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(getFAQs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFAQs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload;
      })
      .addCase(getFAQs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createFAQ.fulfilled, (state, action) => {
        const newFaq = action.payload?.data;
        if (!newFaq) return;

        const category = state.faqs.find(
          (cat) => cat._id === newFaq.categoryId
        );
        if (category) {
          category.faqs.push(newFaq);
        } else {
          state.faqs.push({
            _id: newFaq.categoryId,
            categoryName: "Uncategorized",
            faqs: [newFaq],
          });
        }
      })

      .addCase(updateFAQ.fulfilled, (state, action) => {
        const updatedFaq = action.payload?.data;
        if (!updatedFaq) return;

        state.faqs.forEach((cat) => {
          const index = cat.faqs.findIndex((faq) => faq._id === updatedFaq._id);
          if (index !== -1) cat.faqs[index] = updatedFaq;
        });
      })

      .addCase(deleteFAQ.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.faqs.forEach((cat) => {
          cat.faqs = cat.faqs.filter((faq) => faq._id !== deletedId);
        });
      });
  },
});

export default faqSlice.reducer;
