import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axios from "../../services/axios";
import * as jwtDecodeModule from "jwt-decode";
const jwt_decode = jwtDecodeModule.default;

import { redirect } from "react-router";

const userSlice = createSlice({
  name: "user",
  initialState: {
    is_loading: false,
    auth_user: JSON.parse(localStorage.getItem("auth_user")),
    token: localStorage.getItem("token"),
  },
  reducers: {
    setLoading(state, action) {
      state.is_loading = action.payload;
    },
    setAuthUser(state, action) {
      state.auth_user = action.payload;
      localStorage.setItem("auth_user", JSON.stringify(action.payload));
    },
    setToken(state, action) {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
  },
});

export const { setLoading, setAuthUser, setToken } = userSlice.actions;

export const decodeToken = (token) => {
  try {
    return jwt_decode(token);
  } catch (error) {
    return null;
  }
};
// check token validity and logout if expired
export const checkAuth = () => (dispatch, getState) => {
  const { token } = getState().user;
  if (!token) return;

  const decoded = decodeToken(token);
  if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
    // Token expired, fully logout
    dispatch(setAuthUser(null));
    dispatch(setToken(null));
    toast.info("Session expired. Please login again.");
    window.location.replace("/login"); // full reload, clears history
  } else {
    // optional: sync auth_user from token payload
    dispatch(setAuthUser(decoded));
  }
};

export const signIn = (body) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const data = await axios.post(
      `${import.meta.env.VITE_API_URL}/admin/login`,
      body
    );

    dispatch(setAuthUser(data.admin));
    dispatch(setToken(data.token));
    toast.success(data.message);
    window.location.replace("/");
  } catch (error) {
    console.log("error", error);
  }
  dispatch(setLoading(false));
};

export const logOut = () => async (dispatch) => {
  dispatch(setAuthUser(null));
  dispatch(setToken(null));
  localStorage.removeItem("token");
  localStorage.removeItem("auth_user");
  window.location.replace("/login");
};

export const updateUserInfo = (id, body) => async (dispatch, getState) => {
  dispatch(setLoading(true));

  try {
    const data = await axios.put(
      `${import.meta.env.VITE_API_URL}/admin/update-profile?id=${id}`,
      body
    );
    dispatch(setAuthUser(data?.admin));
    toast.success(data?.message);
  } catch (error) {
    console.log(error?.response?.data);
    toast.error(error?.response?.data?.message || "Unauthorized");
  }

  dispatch(setLoading(false));
};

export const changePassword = (id, body) => async (dispatch, getState) => {
  dispatch(setLoading(true));

  try {
    const data = await axios.post(
      `${import.meta.env.VITE_API_URL}/admin/change-password?id=${id}`,
      body
    );
    // dispatch(setAuthUser(data?.admin));
    toast.success(data?.message);
  } catch (error) {
    console.log(error?.response?.data);
    toast.error(error?.response?.data?.message || "Unauthorized");
  }

  dispatch(setLoading(false));
};
export default userSlice.reducer;
