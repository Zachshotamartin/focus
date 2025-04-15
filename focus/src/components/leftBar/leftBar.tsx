/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import styles from "./leftBar.module.css";
import { useSelector, useDispatch } from "react-redux";
import {
  removeCalendarEvent,
  removeTask,
  setFreeBusy,
} from "../../reducers/eventsSlice";
import { setIsCalendarView } from "../../reducers/pageStateSlice";
import logo from "../../assets/logo.png";
import { FaMapMarkerAlt, FaUsers, FaLink } from "react-icons/fa";

const LeftBar = ({
  onSubmitEvent,
}: {
  onSubmitEvent: (eventDetails: any) => void;
}) => {
  const [eventDetails, setEventDetails] = useState({
    summary: "",
    description: "",
    allDay: false,
    start: "",
    end: "",
    timeZone: "America/Los_Angeles",
    estimatedDuration: 0,
    deadline: "",
    beforeOrAfter: "before",
    timePreference: "12:00 AM",
    location: "",
    guests: "",
    webLink: "",
  });

  // State for resizable left bar
  const [width, setWidth] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  const leftBarRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const dispatch = useDispatch();

  const selectedEvent = useSelector((state: any) => state.events.selectedEvent);
  const isCalendarView = useSelector(
    (state: any) => state.pageState.isCalendarView
  );
  const tasks = useSelector((state: any) => state.events.tasks);
  const [autoSchedule, setAutoSchedule] = useState(false);

  // Handle mouse down on resize handle
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = "ew-resize";
  };

  // Handle mouse move during resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(
        240,
        Math.min(500, startWidthRef.current + deltaX)
      );
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleDelete = async () => {
    console.log("selectedEvent", selectedEvent?._def?.publicId);
    if (selectedEvent) {
      const id = selectedEvent._def.publicId;
      const token = localStorage.getItem("user_token");
      if (token) {
        try {
          const response = await fetch(
            `http://localhost:8080/calendar/event/${id}`,
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
            dispatch(removeCalendarEvent(id));
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
      [name]: name === "estimatedDuration" ? parseFloat(value) : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse guests from comma-separated string to array of objects
    const guestsList = eventDetails.guests
      ? eventDetails.guests.split(',').map(email => ({ email: email.trim() }))
      : [];

    const formattedEvent = {
      summary: eventDetails.summary,
      description: eventDetails.description,
      ...(eventDetails.allDay
        ? {
            start: {
              date: eventDetails.start,
            },
            end: {
              date: eventDetails.end,
            },
          }
        : {
            start: {
              dateTime: new Date(eventDetails.start).toISOString(),
              timeZone: eventDetails.timeZone,
            },
            end: {
              dateTime: new Date(eventDetails.end).toISOString(),
              timeZone: eventDetails.timeZone,
            },
          }),
      // Add new fields if they are provided
      ...(eventDetails.location && { location: eventDetails.location }),
      ...(guestsList.length > 0 && { attendees: guestsList }),
      ...(eventDetails.webLink && { source: { url: eventDetails.webLink } }),
    };

    onSubmitEvent({ formattedEvent: formattedEvent, freeBusy: [] });
    resetForm();
  };

  const handleFetchFreeBusy = async () => {
    const token = localStorage.getItem("user_token");
    if (!token) {
      alert("User token is missing.");
      return;
    }

    try {
      const timeMin = new Date().toISOString();
      const timeMax = new Date(
        new Date().getTime() + 24 * 60 * 60 * 1000 * 14
      ).toISOString(); // 14 days from now

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
    
    // Parse guests from comma-separated string to array of objects
    const guestsList = eventDetails.guests
      ? eventDetails.guests.split(',').map(email => ({ email: email.trim() }))
      : [];
      
    const formattedEvent = {
      summary: eventDetails.summary,
      description: eventDetails.description,
      extendedProperties: {
        private: {
          estimatedDuration: eventDetails.estimatedDuration,
          deadline: eventDetails.deadline || null,
        },
      },
      preferences: {
        beforeOrAfter: eventDetails.beforeOrAfter,
        timePreference: eventDetails.timePreference,
      },
      // Add new fields if they are provided
      ...(eventDetails.location && { location: eventDetails.location }),
      ...(guestsList.length > 0 && { attendees: guestsList }),
      ...(eventDetails.webLink && { source: { url: eventDetails.webLink } }),
    };

    if (
      formattedEvent.extendedProperties.private.deadline &&
      formattedEvent.extendedProperties.private.deadline <=
        new Date().toISOString()
    ) {
      alert("Deadline is in the past. Please choose a future date.");
      return;
    }

    onSubmitEvent({ formattedEvent: formattedEvent, freeBusy: freeBusy });
    resetForm();
  };

  const resetForm = () => {
    setEventDetails({
      summary: "",
      description: "",
      allDay: false,
      start: "",
      end: "",
      timeZone: "America/Los_Angeles",
      estimatedDuration: 0,
      deadline: "",
      beforeOrAfter: "before",
      timePreference: "12:00 AM",
      location: "",
      guests: "",
      webLink: "",
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
            estimatedDuration: 1,
            deadline: new Date().toISOString(),
          },
        },
      };
      const freeBusy = await handleFetchFreeBusy();
      onSubmitEvent({ formattedEvent: formattedEvent, freeBusy: freeBusy });
    }
  };

  return (
    <div
      className={styles.leftBar}
      ref={leftBarRef}
      style={{
        width: `${width}px`,
        maxWidth: isDragging ? "none" : `${width}px`,
      }}
    >
      {/* App Header */}
      <div className={styles.titleContainer}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h1 className={styles.title}>Focus</h1>
      </div>

      {/* View Switcher */}
      <div className={styles.pageStateButtonContainer}>
        <button
          className={isCalendarView ? styles.selected : ""}
          onClick={() => dispatch(setIsCalendarView(true))}
        >
          Calendar
        </button>
        <button
          className={!isCalendarView ? styles.selected : ""}
          onClick={() => dispatch(setIsCalendarView(false))}
        >
          Tasks
        </button>
      </div>

      {/* Event Creation Section */}
      <h2>Create Event</h2>

      {/* Auto/Manual Switch */}
      <div className={styles.modeToggleLabel}>Choose scheduling method:</div>
      <div className={styles.buttonContainer}>
        <button
          className={autoSchedule ? styles.selected : ""}
          onClick={() => setAutoSchedule(true)}
        >
          Auto
        </button>
        <button
          className={!autoSchedule ? styles.selected : ""}
          onClick={() => setAutoSchedule(false)}
        >
          Manual
        </button>
      </div>

      {/* Form Sections */}
      {!autoSchedule && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="summary">Event Title:</label>
            <input
              type="text"
              id="summary"
              name="summary"
              value={eventDetails.summary}
              onChange={handleChange}
              required
              placeholder="Enter event title"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={eventDetails.description}
              onChange={handleChange}
              placeholder="Enter event details"
            />
          </div>

          <div className={styles.formDivider} />
          <h3>Time & Date</h3>

          <div className={styles.checkboxContainer}>
            <label className={styles.checkboxLabel} htmlFor="allDay">
              All Day Event
            </label>
            <input
              type="checkbox"
              id="allDay"
              name="allDay"
              checked={eventDetails.allDay}
              onChange={() => {
                setEventDetails({
                  ...eventDetails,
                  allDay: !eventDetails.allDay,
                });
              }}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="start">
              {eventDetails.allDay ? "Start Date:" : "Start Time:"}
            </label>
            <input
              type={eventDetails.allDay ? "date" : "datetime-local"}
              id="start"
              name="start"
              value={eventDetails.start}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="end">
              {eventDetails.allDay ? "End Date:" : "End Time:"}
            </label>
            <input
              type={eventDetails.allDay ? "date" : "datetime-local"}
              id="end"
              name="end"
              value={eventDetails.end}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formDivider} />
          <h3>Event Details</h3>

          <div className={styles.formGroup}>
            <label htmlFor="location">
              <FaMapMarkerAlt className={styles.formIcon} /> Location:
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={eventDetails.location}
              onChange={handleChange}
              placeholder="Add a location"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="guests">
              <FaUsers className={styles.formIcon} /> Guests:
            </label>
            <input
              type="text"
              id="guests"
              name="guests"
              value={eventDetails.guests}
              onChange={handleChange}
              placeholder="Add emails (comma-separated)"
            />
            <small className={styles.helperText}>
              Enter email addresses separated by commas
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="webLink">
              <FaLink className={styles.formIcon} /> Web Link:
            </label>
            <input
              type="url"
              id="webLink"
              name="webLink"
              value={eventDetails.webLink}
              onChange={handleChange}
              placeholder="Add a relevant URL"
            />
          </div>

          <button className={styles.button} type="submit">
            Add Event
          </button>
        </form>
      )}

      {autoSchedule && (
        <form onSubmit={handleAutoSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="summary">Event Title:</label>
            <input
              type="text"
              id="summary"
              name="summary"
              value={eventDetails.summary}
              onChange={handleChange}
              required
              placeholder="Enter event title"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={eventDetails.description}
              onChange={handleChange}
              placeholder="Enter event details"
            />
          </div>

          <div className={styles.formDivider} />
          <h3>Scheduling Preferences</h3>

          <div className={styles.formGroup}>
            <label htmlFor="timePreference">Time Preference:</label>
            <div
              style={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}
            >
              <select
                id="beforeOrAfter"
                name="beforeOrAfter"
                value={eventDetails.beforeOrAfter}
                onChange={handleSelectChange}
              >
                <option value="before">Before</option>
                <option value="after">After</option>
              </select>

              <input
                type="time"
                id="timePreference"
                name="timePreference"
                value={eventDetails.timePreference}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
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
              required
              placeholder="0.0"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="deadline">Deadline:</label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={eventDetails.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formDivider} />
          <h3>Event Details</h3>

          <div className={styles.formGroup}>
            <label htmlFor="location">
              <FaMapMarkerAlt className={styles.formIcon} /> Location:
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={eventDetails.location}
              onChange={handleChange}
              placeholder="Add a location"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="guests">
              <FaUsers className={styles.formIcon} /> Guests:
            </label>
            <input
              type="text"
              id="guests"
              name="guests"
              value={eventDetails.guests}
              onChange={handleChange}
              placeholder="Add emails (comma-separated)"
            />
            <small className={styles.helperText}>
              Enter email addresses separated by commas
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="webLink">
              <FaLink className={styles.formIcon} /> Web Link:
            </label>
            <input
              type="url"
              id="webLink"
              name="webLink"
              value={eventDetails.webLink}
              onChange={handleChange}
              placeholder="Add a relevant URL"
            />
          </div>

          <button className={styles.button} type="submit">
            Add Event
          </button>
        </form>
      )}

      {/* Action Buttons */}
      <div>
        <button
          className={styles.buttonBottom}
          onClick={handleDelete}
          disabled={!selectedEvent}
        >
          Delete Event
        </button>
        <button className={styles.buttonBottom} onClick={handleTestAdd}>
          Test Add
        </button>
      </div>

      {/* Resize Handle */}
      <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
    </div>
  );
};

export default LeftBar;
