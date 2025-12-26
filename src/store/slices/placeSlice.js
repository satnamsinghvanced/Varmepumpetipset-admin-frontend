import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
const IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE;

const fixImageUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  return url.startsWith("http") ? url : `${IMAGE_URL}${url}`;
};

export const getPlaces = createAsyncThunk(
  "places/getPlaces",
  async ({ page = 1, limit = 10, search = "" } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/places?page=${page}&limit=${limit}&search=${search}`
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getPlaceById = createAsyncThunk(
  "places/getPlaceById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/places/detail/${id}`);

      if (data?.data?.icon) {
        data.data.icon = fixImageUrl(data.data.icon);
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createPlace = createAsyncThunk(
  "places/createPlace",
  async (placeData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/places/create", placeData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updatePlace = createAsyncThunk(
  "places/updatePlace",
  async ({ id, placeData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/places/update/${id}`, placeData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deletePlace = createAsyncThunk(
  "places/deletePlace",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/places/delete/${id}`);
      return { id, message: data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const importPlaces = createAsyncThunk(
  "places/importPlaces",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/upload/csv-places", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const placeSlice = createSlice({
  name: "places",
  initialState: {
    places: { data: [], pagination: {} },
    selectedPlace: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearSelectedPlace: (state) => {
      state.selectedPlace = null;
    },
    clearError: (state) => {
      state.error = null;
    },

    setPlaces: (state, action) => {
      state.places = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlaces.fulfilled, (state, action) => {
        state.loading = false;
        state.places = action.payload;
      })
      .addCase(getPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch places";
      })

      .addCase(getPlaceById.fulfilled, (state, action) => {
        state.selectedPlace = action.payload.data || action.payload;
      })

      .addCase(createPlace.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPlace.fulfilled, (state, action) => {
        state.loading = false;
        state.places.data.push(action.payload.data || action.payload);
      })
      .addCase(createPlace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create place";
      })

      .addCase(updatePlace.fulfilled, (state, action) => {
        const updated = action.payload.data;

        if (!updated?._id) return;

        const index = state.places.data.findIndex((p) => p._id === updated._id);

        if (index !== -1) state.places.data[index] = updated;

        if (state.selectedPlace?._id === updated._id)
          state.selectedPlace = updated;
      })

      .addCase(deletePlace.fulfilled, (state, action) => {
        state.loading = false;

        state.places.data = state.places.data.filter(
          (p) => p._id !== action.payload.id
        );

        if (
          state.selectedPlace &&
          state.selectedPlace._id === action.payload.id
        ) {
          state.selectedPlace = null;
        }
      })

      .addCase(importPlaces.pending, (state) => {
        state.loading = true;
      })
      .addCase(importPlaces.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(importPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to import places";
      });
  },
});

export const { clearSelectedPlace, clearError, setPlaces } = placeSlice.actions;
export default placeSlice.reducer;
