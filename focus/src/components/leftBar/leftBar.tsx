/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import styles from "./leftBar.module.css";
import { useSelector, useDispatch } from "react-redux";
import {
  removeCalendarEvent,
  removeTask,
  setFreeBusy,
} from "../../reducers/eventsSlice";
import { setIsCalendarView } from "../../reducers/pageStateSlice";
import logo from "../../assets/logo.png";
const LeftBar = ({
  onSubmitEvent,
}: {
  onSubmitEvent: (eventDetails: any) => void;
}) => {
  const [eventDetails, setEventDetails] = useState({
    summary: "",
    description: "",
    start: "",
    end: "",
    timeZone: "America/Los_Angeles",
    estimatedDuration: 0, // Added estimatedDuration field
    deadline: "", // Added deadline field
  });


  const dispatch = useDispatch();

  const selectedEvent = useSelector((state: any) => state.events.selectedEvent);

  const tasks = useSelector((state: any) => state.events.tasks);
  //const freeBusy = useSelector((state: any) => state.events.freebusy);
  const [autoSchedule, setAutoSchedule] = useState(false);

  const handleDelete = async () => {
    if (selectedEvent) {
      const token = localStorage.getItem("user_token");
      console.log("Token:", token);
      if (token) {
        try {
          const response = await fetch(
            `https://focus-447201.wl.r.appspot.com/calendar/event/${selectedEvent.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            console.log("Event deleted successfully");
            dispatch(removeTask(selectedEvent));
            dispatch(removeCalendarEvent());
          } else {
            console.error("Failed to delete event");
          }
        } catch (error) {
          console.error("Error deleting event:", error);
        }
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEventDetails((prev) => ({
      ...prev,
      [name]: name === "estimatedDuration" ? parseFloat(value) : value, // Parse duration as float
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedEvent = {
      summary: eventDetails.summary,
      description: eventDetails.description,
      start: {
        dateTime: new Date(eventDetails.start).toISOString(),
        timeZone: eventDetails.timeZone,
      },
      end: {
        dateTime: new Date(eventDetails.end).toISOString(),
        timeZone: eventDetails.timeZone,
      },
      // extendedProperties: {
      //   private: {
      //     estimatedDuration: eventDetails.estimatedDuration, // Include estimated duration
      //     deadline: eventDetails.deadline || null, // Include deadline if provided
      //   },
      // },
    };

    onSubmitEvent({ formattedEvent: formattedEvent, freeBusy: [] }); // Call the provided function
    setEventDetails({
      summary: "",
      description: "",
      start: "",
      end: "",
      timeZone: "America/Los_Angeles",
      estimatedDuration: 0,
      deadline: "",
    });
  };
  const handleFetchFreeBusy = async () => {
    const token = localStorage.getItem("user_token");
    console.log(token);
    if (!token) {
      alert("User token is missing.");
      return;
    }

    try {
      const timeMin = new Date().toISOString();
      const timeMax = new Date(
        new Date().getTime() + 24 * 60 * 60 * 1000 * 14
      ).toISOString(); // 24 hours from now

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/freeBusy",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timeMin,
            timeMax,
            timeZone: "UTC",
            items: [{ id: "primary" }],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("FreeBusy Data:", data);

        // Dispatch free/busy data to Redux
        dispatch(setFreeBusy(data.calendars.primary.busy || []));
        return data.calendars.primary.busy || [];
      } else {
        console.error("Failed to fetch free/busy data:", await response.text());
        alert("Failed to fetch free/busy data.");
      }
    } catch (error) {
      console.error("Error fetching free/busy data:", error);
      alert("Error fetching free/busy data.");
    }
  };
  const handleAutoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const freeBusy = await handleFetchFreeBusy();
    const formattedEvent = {
      summary: eventDetails.summary,
      description: eventDetails.description,
      extendedProperties: {
        private: {
          estimatedDuration: eventDetails.estimatedDuration, // Include estimated duration
          deadline: eventDetails.deadline || null, // Include deadline if provided
        },
      },
    };

    onSubmitEvent({ formattedEvent: formattedEvent, freeBusy: freeBusy }); // Call the provided function
    setEventDetails({
      summary: "",
      description: "",
      start: "",
      end: "",
      timeZone: "America/Los_Angeles",
      estimatedDuration: 0,
      deadline: "",
    });
  };

  const handleTestAdd = async () => {
    const startIdx = tasks.length;
    for (let i = startIdx; i < startIdx + 5; i++) {
      const formattedEvent = {
        summary: `Task ${i}`,
        description: "Description",
        extendedProperties: {
          private: {
            estimatedDuration: 1, // Include estimated duration
            deadline: new Date().toISOString(), // Include deadline if provided
          },
        },
      };
      const freeBusy = await handleFetchFreeBusy();
      onSubmitEvent({ formattedEvent: formattedEvent, freeBusy: freeBusy }); // Call the provided function
    }
  };

  return (
    <div className={styles.leftBar}>
      <div className={styles.titleContainer}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h1 className={styles.title}>Focus</h1>
      </div>
      <div className={styles.pageStateButtonContainer}>
        <button onClick={() => dispatch(setIsCalendarView(true))}>
          Calendar
        </button>
        <button onClick={() => dispatch(setIsCalendarView(false))}>
          Tasks
        </button>
      </div>
      <div className={styles.buttonContainer}>
        <button onClick={() => setAutoSchedule(true)}>Auto</button>
        <button onClick={() => setAutoSchedule(false)}>Manual</button>
      </div>
      <h2>Create Event</h2>
      {!autoSchedule && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label htmlFor="summary">Event Title:</label>
            <input
              type="text"
              id="summary"
              name="summary"
              value={eventDetails.summary}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={eventDetails.description}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="start">Start Time:</label>
            <input
              type="datetime-local"
              id="start"
              name="start"
              value={eventDetails.start}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="end">End Time:</label>
            <input
              type="datetime-local"
              id="end"
              name="end"
              value={eventDetails.end}
              onChange={handleChange}
              required
            />
          </div>
          <button className={styles.button} type="submit">
            Add Event
          </button>
        </form>
      )}
      {autoSchedule && (
        <form onSubmit={handleAutoSubmit} className={styles.form}>
          <div>
            <label htmlFor="summary">Event Title:</label>
            <input
              type="text"
              id="summary"
              name="summary"
              value={eventDetails.summary}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={eventDetails.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="estimatedDuration">
              Estimated Duration (hours):
            </label>
            <input
              type="number"
              id="estimatedDuration"
              name="estimatedDuration"
              value={eventDetails.estimatedDuration}
              onChange={handleChange}
              step="0.1"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="deadline">Deadline:</label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={eventDetails.deadline}
              onChange={handleChange}
            />
          </div>
          <button className={styles.button} type="submit">
            Add Event
          </button>
        </form>
      )}
      <button className={styles.buttonBottom} onClick={handleDelete}>
        Delete Event
      </button>
      <button className={styles.buttonBottom} onClick={handleTestAdd}>
        Test Add
      </button>
    </div>
  );
};

export default LeftBar;
