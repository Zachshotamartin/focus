/* eslint-disable @typescript-eslint/no-explicit-any */
// authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface EventState {
  events: any[];

  selectedEvent: any | null;

  tasks: any[];
  taskGPTConversation: { id: string; conversation: string[][] }[];
  freebusy: any[];
  loading: boolean;
}

const initialState: EventState = {
  events: [],
  selectedEvent: null,
  tasks: [],
  taskGPTConversation: [],
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
    removeCalendarEvent: (state, action: PayloadAction<any>) => {
      state.events = state.events.filter(
        (event) => event.id !== action.payload.id
      );
      state.selectedEvent = null;
      console.log("event removed");
      console.log("events", state.events);
      console.log("action ,", action.payload);
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
      state.taskGPTConversation = state.tasks.map((task) => ({
        id: task.id,
        conversation: [],
      }));
    },
    addTask: (state, action: PayloadAction<any>) => {
      state.tasks.push(action.payload);
      state.taskGPTConversation.push({
        id: action.payload.id,
        conversation: [],
      });
    },

    removeTask: (state, action: PayloadAction<any>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload.id);
      state.taskGPTConversation = state.taskGPTConversation.filter(
        (task) => task.id !== action.payload.id
      );
    },
    updateGPTConversation: (state, action: PayloadAction<any>) => {
      const { taskId, message } = action.payload;
      state.taskGPTConversation = state.taskGPTConversation.map((task) => {
        if (task.id === taskId) {
          return { ...task, conversation: message };
        }
        return task;
      });
    },
    setFreeBusy: (state, action: PayloadAction<any[]>) => {
      state.freebusy = action.payload;
    },
    updateCalendarEvent: (state, action) => {
      const updatedEvent = action.payload;
      // Update the event in the events array
      state.events = state.events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      );

      // If it's also a task, update in tasks array
      if (updatedEvent.extendedProperties?.private?.deadline) {
        state.tasks = state.tasks.map((task) =>
          task.id === updatedEvent.id ? updatedEvent : task
        );
      }
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
  updateGPTConversation,
  updateCalendarEvent,
} = eventsSlice.actions;

export default eventsSlice.reducer;
