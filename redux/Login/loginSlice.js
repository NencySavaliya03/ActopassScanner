import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    isLoggedIn: false,
    userData: {},
    historyData: {}
  };

export const loginSlice = createSlice({
    name: 'Login',
    initialState,
    reducers: {
        LOGIN_SUCCESS: (state, action) => {
          state.isLoggedIn = true;
          state.userData = action.payload;
        },
        LOGIN_FAILURE: (state) => {
          state.isLoggedIn = false;
          state.userData = {};
        },
        LOGIN_DATA: () => {
          state.userData = action.payload;
        },
        SET_USERDATA: (state, action) => {
          state.userData = action.payload;
        },
        SET_HISTORYDATA: (state, action) => {
          state.historyData = action.payload;
      },
    }
})

export const { LOGIN_SUCCESS, LOGIN_FAILURE, SET_USERDATA, SET_HISTORYDATA } = loginSlice.actions

export default loginSlice.reducer