import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { toast } from "react-toastify";

export const getAgents = createAsyncThunk(
  "agents/getAgents",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/real-estate-agent/`);
      // console.log(data)
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getAgentById = createAsyncThunk(
  "agents/getAgentById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/real-estate-agent/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createAgent = createAsyncThunk(
  "agents/createAgent",
  async (agentData, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/real-estate-agent/create`, agentData);
      toast.success(data.message || "Agent created successfully");
      return data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create agent");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateAgent = createAsyncThunk(
  "agents/updateAgent",
  async ({ id, agentData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/real-estate-agent/update/${id}`,
        agentData
      );
      toast.success(data.message || "Supplier updated successfully");
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update Suppliers");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteAgent = createAsyncThunk(
  "agents/deleteAgent",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/real-estate-agent/delete/${id}`);
      toast.success(data.message || "Agent deleted successfully");
      return id;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete agent");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const realEstateAgentSlice = createSlice({
  name: "agents",
  initialState: {
    agents: [],
    selectedAgent: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedAgent: (state) => {
      state.selectedAgent = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAgents: (state, action) => {
      state.agents = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(getAgents.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = action.payload;
      })
      .addCase(getAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAgentById.pending, (state) => {
        state.loading = true;
        state.selectedAgent = null;
      })
      .addCase(getAgentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAgent = action.payload?.data || action.payload;
      })
      .addCase(getAgentById.rejected, (state) => {
        state.loading = false;
        state.selectedAgent = null;
      })

      .addCase(createAgent.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAgent.fulfilled, (state, action) => {
        state.loading = false;
        state.agents.push(action.payload);
      })
      .addCase(createAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateAgent.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAgent.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.agents.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.agents[index] = updated;
      })
      .addCase(updateAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteAgent.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = state.agents.filter((a) => a._id !== action.payload);
      })
      .addCase(deleteAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedAgent, clearError, setAgents } =
  realEstateAgentSlice.actions;

export default realEstateAgentSlice.reducer;
