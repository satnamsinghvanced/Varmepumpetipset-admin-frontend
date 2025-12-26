import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
const IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE;

const fixImageUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  return url.startsWith("http") ? url : `${IMAGE_URL}${url}`;
};

export const getCompanies = createAsyncThunk(
  "companies/getCompanies",
  async ({ page = 1, limit = 10, search = "" } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/companies?page=${page}&limit=${limit}&search=${search}`
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getCompaniesAll = createAsyncThunk(
  "companies/getCompaniesAll",
  async ({ search = "" } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/companies/all?search=${search}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getCompanyById = createAsyncThunk(
  "companies/getCompanyById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/companies/detail/${id}`);
      // return data;
      return {
        ...res.data.data,
        companyImage: fixImageUrl(res.data.data.companyImage),
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createCompany = createAsyncThunk(
  "companies/createCompany",
  async (companyData, { rejectWithValue }) => {
    try {
      console.log(companyData);
      const { data } = await api.post("/companies/create", companyData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateCompany = createAsyncThunk(
  "companies/updateCompany",
  async ({ id, companyData }, { rejectWithValue }) => {
    try {
      console.log("companyData:", companyData);
      const { data } = await api.put(`/companies/update/${id}`, companyData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteCompany = createAsyncThunk(
  "companies/deleteCompany",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/companies/delete/${id}`);
      return { id, message: data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const importCompanies = createAsyncThunk(
  "companies/importCompanies",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/upload/csv-companies", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const companySlice = createSlice({
  name: "companies",
  initialState: {
    companies: { data: [], pagination: {} },
    selectedCompany: null,
    allCompanies: [],

    loading: false,
    error: null,
  },

  reducers: {
    clearSelectedCompany: (state) => {
      state.selectedCompany = null;
    },
    clearError: (state) => {
      state.error = null;
    },

    setCompanies: (state, action) => {
      state.companies = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(getCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch companies";
      })
      .addCase(getCompaniesAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCompaniesAll.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.allCompanies = action.payload.data;
      })

      .addCase(getCompaniesAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to fetch all companies");
      })
      .addCase(getCompanyById.fulfilled, (state, action) => {
        state.selectedCompany = action.payload.data || action.payload;
      })

      .addCase(createCompany.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies.data.push(action.payload.data || action.payload);
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create company";
      })

      .addCase(updateCompany.fulfilled, (state, action) => {
        const updatedCompany = action.payload.data;

        if (!updatedCompany?._id) return;

        const index = state.companies.data.findIndex(
          (c) => c._id === updatedCompany._id
        );

        if (index !== -1) {
          state.companies.data[index] = updatedCompany;
        }

        if (state.selectedCompany?._id === updatedCompany._id) {
          state.selectedCompany = updatedCompany;
        }
      })

      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.loading = false;

        state.companies.data = state.companies.data.filter(
          (c) => c._id !== action.payload.id
        );

        if (
          state.selectedCompany &&
          state.selectedCompany._id === action.payload.id
        ) {
          state.selectedCompany = null;
        }
      })

      .addCase(importCompanies.pending, (state) => {
        state.loading = true;
      })
      .addCase(importCompanies.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(importCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to import companies";
      })

      .addMatcher(
        (action) =>
          [
            createCompany.pending,
            updateCompany.pending,
            deleteCompany.pending,
          ].includes(action.type),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [
            createCompany.rejected,
            updateCompany.rejected,
            deleteCompany.rejected,
          ].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || "An action failed";
        }
      );
  },
});

export const { clearSelectedCompany, clearError, setCompanies } =
  companySlice.actions;

export default companySlice.reducer;
