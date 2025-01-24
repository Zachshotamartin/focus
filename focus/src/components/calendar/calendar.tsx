/* eslint-disable @typescript-eslint/no-explicit-any */
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule"; // RRule plugin
import { RRule } from "rrule";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./calendar.module.css";
import Task from "../task/task";
import SwipeableList from "../swipeableList/swipeableList";
import Logout from "../logout/logout";

import {
  setCalendarEvents,
  setSelectedEvent,
  setTasks,
} from "../../reducers/eventsSlice";

import { setAllTasks } from "../../reducers/pageStateSlice";

function GoogleCalendar() {
  const dispatch = useDispatch();
  const userData = JSON.parse(localStorage.getItem("user_info") || "{}");
  const [events, setEvents] = useState<any[]>([]);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");

  const calendarEvents = useSelector((state: any) => state.events.events);
  const isCalendarView = useSelector(
    (state: any) => state.pageState.isCalendarView
  );
  const allTasks = useSelector((state: any) => state.pageState.allTasks);
  const [showAllTasks, setShowAllTasks] = useState(allTasks);
  const tasks = useSelector((state: any) => state.events.tasks);
  const [viewTasks, setViewTasks] = useState<any[]>(tasks);
  function parseRRule(rruleString: string) {
    const rrule = RRule.fromString(rruleString); // Parse the RRule string into an RRule object
    const daysOfWeek = rrule.options.byweekday;

    daysOfWeek.forEach((day: any, index: number) => {
      if (day === 6) {
        daysOfWeek[index] = 0;
      } else {
        daysOfWeek[index] = day + 1;
      }
    });

    return daysOfWeek;
  }
  function extractTime(dateTime: string | number | Date) {
    const date = new Date(dateTime);
    return date.toLocaleTimeString("en-GB", { hour12: false }); // 24-hour format
  }

  useEffect(() => {
    const formattedEvents = calendarEvents;
    console.log("formattedEvents", formattedEvents);
    setEvents(formattedEvents);
    console.log("events updated");
  }, [calendarEvents]);

  useEffect(() => {
    setViewTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    setShowAllTasks(allTasks);
  }, [allTasks]);

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      const token = localStorage.getItem("user_token");

      if (token) {
        try {
          const response = await fetch(
            `http://localhost:8080/calendar?token=${token}`
          );
          const data = await response.json();
          console.log("data", data.items);

          if (data.items) {
            // Map events
            const mappedEvents = data.items.map((event: any) => {
              // Parse RRule if present
              const rrule = event.recurrence ? event.recurrence[0] : null;
              let recurringProps = {};

              // Transform RRule or other recurrence information
              if (rrule) {
                const daysOfWeek = parseRRule(rrule); // Helper function to parse RRule
                const startTime = event.start.dateTime
                  ? extractTime(event.start.dateTime)
                  : extractTime(event.start.date);
                const endTime = event.end.dateTime
                  ? extractTime(event.end.dateTime)
                  : extractTime(event.end.date);
                recurringProps = {
                  daysOfWeek: daysOfWeek, // [0, 1, ...] for days of the week
                  startTime: startTime, // HH:mm:ss or similar
                  endTime: endTime, // HH:mm:ss or similar

                  groupId: event.id, // Optional: group events with the same ID
                };
              }

              return {
                id: event.id,
                title: event.summary,
                start: event.start.dateTime || event.start.date, // One-time events
                end: event.end.dateTime || event.end.date,
                allDay: !event.start.dateTime,
                description: event.description,
                extendedProperties: event.extendedProperties,
                ...recurringProps, // Merge recurring event properties if present
              };
            });

            dispatch(setCalendarEvents(mappedEvents));

            // Filter tasks with specific extended properties
            const newTasks = mappedEvents.filter(
              (event: any) =>
                event.extendedProperties?.private?.deadline &&
                event.extendedProperties?.private?.estimatedDuration
            );

            const finalTasks = newTasks.map((task: any) => ({
              id: task.id,
              title: task.title,
              start: task.start,
              end: task.end,
              allDay: task.allDay,
              extendedProperties: task.extendedProperties,
            }));

            dispatch(setTasks(finalTasks));
          }
        } catch (error) {
          console.error("Error fetching calendar events:", error);
        }
      }
    };

    fetchCalendarEvents();
  }, []); // Runs once on component mount

  const handleSelect = ({ start, end }: any) => {
    const title = window.prompt("New Event name");
    if (title) {
      setEvents((events) => [
        ...events,
        {
          title,
          start,
          end,
          allDay: end.getDate() === start.getDate(),
        },
      ]);
    }
  };

  const handleEventClick = ({ event }: any) => {
    dispatch(setSelectedEvent(event));
    console.log(event.id);
  };

  const handleQuickAdd = async () => {
    setNaturalLanguageInput(""); // Clear the input
    if (!naturalLanguageInput.trim()) {
      alert("Please enter a natural language event description.");
      return;
    }

    const token = localStorage.getItem("user_token");

    if (!token) {
      alert("User is not authenticated.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/calendar/quickadd", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: naturalLanguageInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "Error adding event:",
          errorData.details || errorData.error
        );
        alert("Failed to add event.");
        return;
      }

      const data = await response.json();
      console.log("Quick add response:", data);

      setEvents((prevEvents) => [
        ...prevEvents,
        {
          id: data.event.id,
          title: data.event.summary,
          start: new Date(data.event.start.dateTime || data.event.start.date),
          end: new Date(data.event.end.dateTime || data.event.end.date),
          allDay: !data.event.start.dateTime,
        },
      ]);
    } catch (error) {
      console.error("Error adding quick add event:", error);
      alert("Failed to add event.");
    }
  };

  return (
    <div className={styles.calendar}>
      {isCalendarView && (
        <>
          <div className={styles.topRow}>
            <div className={styles.quickAdd}>
              <input
                className={styles.naturalLanguageInput}
                placeholder="Add event with natural language"
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
              />
              <button className={styles.button} onClick={handleQuickAdd}>
                Submit
              </button>
            </div>
            <div className={styles.profileContainer}>
              {userData && userData.email ? (
                <>
                  {userData.picture && (
                    <img
                      src={userData.picture}
                      alt="User Profile"
                      className={styles.profileImage}
                    />
                  )}
                  <p className={styles.email}>{userData.email}</p>
                  <Logout />
                </>
              ) : (
                <p>Loading user information...</p>
              )}
            </div>
          </div>
          <div style={{ width: "100%" }}>
            <Fullcalendar
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                rrulePlugin,
              ]}
              initialView="dayGridMonth"
              events={events} // Your transformed events
              selectable={true}
              select={handleSelect}
              eventClick={handleEventClick}
              headerToolbar={{
                start: "today prev,next",
                center: "title",
                end: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              height="90vh"
              timeZone="local"
            />
          </div>
        </>
      )}
      {!isCalendarView && (
        <div className={styles.tasks}>
          {tasks.length > 0 && (
            <div className={styles.tasksContainer}>
              <div className={styles.topRow}>
                <div className={styles.IsCalendarViewButtonContainer}>
                  <button
                    className={showAllTasks ? styles.selected : ""}
                    onClick={() => dispatch(setAllTasks(true))}
                  >
                    {" "}
                    View all tasks
                  </button>
                  <button
                    className={!showAllTasks ? styles.selected : ""}
                    onClick={() => {
                      console.log("allTasks", showAllTasks);
                      if (!showAllTasks) {
                        return;
                      }
                      dispatch(setSelectedEvent(tasks[0]));
                      dispatch(setAllTasks(false));
                    }}
                  >
                    {" "}
                    Focus Mode{" "}
                  </button>
                </div>
                <div className={styles.profileContainer}>
                  {userData && userData.email ? (
                    <>
                      {userData.picture && (
                        <img
                          src={userData.picture}
                          alt="User Profile"
                          className={styles.profileImage}
                        />
                      )}
                      <p className={styles.email}>{userData.email}</p>
                      <Logout />
                    </>
                  ) : (
                    <p>Loading user information...</p>
                  )}
                </div>
              </div>
              {showAllTasks && (
                <ul className={styles.taskList}>
                  {viewTasks.map((task: any) => (
                    <Task key={task.id} task={task} />
                  ))}
                </ul>
              )}
              {!showAllTasks && <SwipeableList />}
            </div>
          )}
          {tasks.length === 0 && <p>No tasks found.</p>}
        </div>
      )}
    </div>
  );
}

export default GoogleCalendar;
