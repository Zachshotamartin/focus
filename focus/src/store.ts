import { configureStore } from "@reduxjs/toolkit";
import eventsSlice from "./reducers/eventsSlice";
import pageStateSlice from "./reducers/pageStateSlice";

const store = configureStore({
  reducer: {
    events: eventsSlice,
    pageState: pageStateSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializability check
    }),
  preloadedState: {
    events: {
      events: [],
      selectedEvent: null,
      tasks: [],
      freebusy: [],
      loading: false,
    },
    pageState: { isCalendarView: true, allTasks: true },
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export default store;
