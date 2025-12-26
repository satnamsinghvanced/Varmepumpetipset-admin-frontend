import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const getAllLeads = createAsyncThunk(
  "lead/getAllLeads",
  async (
    { page = 1, limit = 10, search = "", status = "", formType = "" },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      if (formType) params.append("formType", formType);
      const res = await api.get(`lead-logs/all?${params.toString()}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching leads");
    }
  }
);
export const getPartnerLeads = createAsyncThunk(
  "lead/getPartnerLeads",
  async (
    { page = 1, limit = 10, search = "" },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (search) params.append("search", search);

      const res = await api.get(
        `lead-logs/partner-leads?${params.toString()}`
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching partner leads"
      );
    }
  }
);

export const updateLeadStatus = createAsyncThunk(
  "lead/updateStatus",
  async ({ leadId, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/lead-logs/status`, { leadId, status });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update status");
    }
  }
);

export const updateLeadProfit = createAsyncThunk(
  "lead/updateProfit",
  async ({ leadId, profit }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/lead-logs/update-profit`, {
        leadId,
        profit,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update profit");
    }
  }
);

export const getLeadById = createAsyncThunk(
  "lead/getLeadById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/lead-logs/details/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch lead");
    }
  }
);

const leadSlice = createSlice({
  name: "lead",
  initialState: {
    leads: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 1,
    },
    selectedLead: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(getAllLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.leads;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load leads";
      })
      .addCase(getPartnerLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPartnerLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.leads;
        state.pagination = action.payload.pagination;
      })
      .addCase(getPartnerLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load partner leads";
      })

      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.leads.findIndex((l) => l._id === updated._id);
        if (index !== -1) state.leads[index] = updated;
      })

      .addCase(updateLeadProfit.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.leads.findIndex((l) => l._id === updated._id);
        if (index !== -1) state.leads[index] = updated;
      })

      .addCase(getLeadById.pending, (state) => {
        state.loading = true;
        state.selectedLead = null;
      })
      .addCase(getLeadById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLead = action.payload;
      })
      .addCase(getLeadById.rejected, (state) => {
        state.loading = false;
        state.selectedLead = null;
      });
  },
});

export default leadSlice.reducer;
