
import { configureStore } from '@reduxjs/toolkit'
import loginSlice from './Login/loginSlice'

export const store = configureStore({
  reducer: {
    loginData: loginSlice,
  },
})