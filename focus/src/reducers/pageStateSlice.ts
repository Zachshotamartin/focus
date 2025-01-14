/* eslint-disable @typescript-eslint/no-explicit-any */
// authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface pageState {
  isCalendarView: boolean;
  allTasks: boolean;
}

const initialState: pageState = {
  isCalendarView: true,
  allTasks: true,
};

const pageStateSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setIsCalendarView: (state, action: PayloadAction<boolean>) => {
      state.isCalendarView = action.payload;
    },
    setAllTasks: (state, action: PayloadAction<boolean>) => {
      state.allTasks = action.payload;
    },
  },
});

export const { setIsCalendarView, setAllTasks } = pageStateSlice.actions;

export default pageStateSlice.reducer;
