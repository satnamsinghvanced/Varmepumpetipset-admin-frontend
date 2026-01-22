import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
const IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE;

const fixImageUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  return url.startsWith("http") ? url : `${IMAGE_URL}${url}`;
};

export const getCounties = createAsyncThunk(
  "county/getCounties",
  async ({ page = 1, limit = 10, search = "" } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/counties?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}`
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const getCountiesForPlace = createAsyncThunk(
  "county/getCounties",
  async ({ rejectWithValue }) => {
    try {
      const { data } = await api.get(`/counties/counties-for-place`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const getCountyById = createAsyncThunk(
  "county/getCountyById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/counties/detail/${id}`);

      // --- FIX ICON URL ---
      if (data?.data?.icon) {
        data.data.icon = fixImageUrl(data.data.icon);
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createCounty = createAsyncThunk(
  "county/createCounty",
  async ({ countyData, isFormData }, { rejectWithValue }) => {
    try {
      // If using FormData, send it directly
      const config = isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
      const { data } = await api.post("/counties/create", countyData, config);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);



export const updateCounty = createAsyncThunk(
  "county/updateCounty",
  async ({ id, countyData, isFormData }, { rejectWithValue }) => {
    try {
      const config = isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
      const { data } = await api.put(`/counties/update/${id}`, countyData, config);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteCounty = createAsyncThunk(
  "county/deleteCounty",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/counties/delete/${id}`);
      return { id, message: data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const importCounties = createAsyncThunk(
  "county/importCounties",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/counties/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const countySlice = createSlice({
  name: "counties",
  initialState: {
    counties: [],
    selectedCounty: null,
    pagination: { currentPage: 1, totalPages: 1, totalCounties: 0 },
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearSelectedCounty: (state) => {
      state.selectedCounty = null;
    },
    clearError: (state) => {
      state.error = null;
    },

    setCounties: (state, action) => {
      state.counties = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(getCounties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCounties.fulfilled, (state, action) => {
        state.loading = false;
        state.counties = action.payload.data || [];
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalCounties: action.payload.totalCounties,
        };
      })
      .addCase(getCounties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch counties";
        state.counties = [];
      })

      .addCase(getCountyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCountyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCounty = action.payload.data;
      })
      .addCase(getCountyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch county";
      })

      .addCase(createCounty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCounty.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(createCounty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create county";
      })

      .addCase(updateCounty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCounty.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(updateCounty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update county";
      })

      .addCase(deleteCounty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCounty.fulfilled, (state, action) => {
        state.loading = false;
        state.counties = state.counties.filter(
          (county) => county._id !== action.payload.id
        );
        state.successMessage = action.payload.message;
      })
      .addCase(deleteCounty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete county";
      })

      .addCase(importCounties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importCounties.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(importCounties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to import counties";
      });
  },
});
export const { clearSelectedCounty, clearError, setCounties } =
  countySlice.actions;
export default countySlice.reducer;
