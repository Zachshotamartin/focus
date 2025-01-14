/* eslint-disable @typescript-eslint/no-explicit-any */
// authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface EventState {
  events: any[];

  selectedEvent: any | null;

  tasks: any[];
  freebusy: any[];
  loading: boolean;
}

const initialState: EventState = {
  events: [],
  selectedEvent: null,
  tasks: [],
  freebusy: [],
  loading: true,
};

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setCalendarEvents: (state, action: PayloadAction<any[]>) => {
      state.events = action.payload;
    },

    addCalendarEvent: (state, action: PayloadAction<any>) => {
      state.events.push(action.payload);
    },
    removeCalendarEvent: (state) => {
      if (state.selectedEvent !== null) {
        state.events = state.events.filter(
          (event) => event.id !== state.selectedEvent.id
        );
      }
      state.selectedEvent = null;
    },

    setSelectedEvent: (state, action: PayloadAction<any>) => {
      const event = action.payload;
      state.selectedEvent = {
        ...event,
        start:
          event.start instanceof Date ? event.start.toISOString() : event.start,
        end: event.end instanceof Date ? event.end.toISOString() : event.end,
      };
    },
    setTasks: (state, action: PayloadAction<any[]>) => {
      state.tasks = action.payload;
      state.loading = false;
    },
    addTask: (state, action: PayloadAction<any>) => {
      state.tasks.push(action.payload);
    },

    removeTask: (state, action: PayloadAction<any>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload.id);
    },
    setFreeBusy: (state, action: PayloadAction<any[]>) => {
      state.freebusy = action.payload;
    },
  },
});

export const {
  setCalendarEvents,
  addCalendarEvent,
  removeCalendarEvent,
  setSelectedEvent,
  setTasks,
  addTask,
  removeTask,
  setFreeBusy,
} = eventsSlice.actions;

export default eventsSlice.reducer;
