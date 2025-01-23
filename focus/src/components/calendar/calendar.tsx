/* eslint-disable @typescript-eslint/no-explicit-any */
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

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
  console.log("userData", userData);
  const [events, setEvents] = useState<any[]>([]); // Use proper typing here for events
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");

  const calendarEvents = useSelector((state: any) => state.events.events);
  const isCalendarView = useSelector(
    (state: any) => state.pageState.isCalendarView
  );

  const allTasks = useSelector((state: any) => state.pageState.allTasks);
  const [showAllTasks, setShowAllTasks] = useState(allTasks);
  const tasks = useSelector((state: any) => state.events.tasks);
  const [viewTasks, setViewTasks] = useState<any[]>(tasks);

  useEffect(() => {
    console.log("calendarEvents", calendarEvents);
    console.log("tasks", tasks);
    // Map events for display
    const newEvents = calendarEvents.map((event: any) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
      allDay: event.allDay,
    }));
    setEvents(newEvents);
  }, [calendarEvents, tasks]);

  useEffect(() => {
    console.log("tasks", tasks);
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
            // Map the events to the format required by react-big-calendar
            const mappedEvents = data.items.map((event: any) => ({
              id: event.id,
              title: event.summary,
              start: event.start.dateTime || event.start.date, // Keep as a string
              end: event.end.dateTime || event.end.date,
              allDay: !event.start.dateTime,
              description: event.description,

              extendedProperties: event.extendedProperties,
            }));
            console.log("repeats", mappedEvents);
            dispatch(setCalendarEvents(mappedEvents));
            const newTasks = mappedEvents.filter(
              (event: any) =>
                event.extendedProperties?.private?.deadline &&
                event.extendedProperties?.private?.estimatedDuration
            );

            // Format tasks for the store
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
  }, []); // Empty dependency array means this will run once when the component mounts

  // Handle event selection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const handleQuickAdd = async () => {
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

      // Add the new event to your events state
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

      setNaturalLanguageInput(""); // Clear the input
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
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={"dayGridMonth"}
              events={events}
              selectable={true}
              select={handleSelect}
              selectMirror={true}
              
              handleWindowResize={true}
              headerToolbar={{
                start: "today prev,next", // will normally be on the left. if RTL, will be on the right
                center: "title",
                end: "dayGridMonth,timeGridWeek,timeGridDay", // will normally be on the right. if RTL, will be on the left
              }}
              height={"90vh"}
              
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
                  <button onClick={() => dispatch(setAllTasks(true))}>
                    {" "}
                    View all tasks
                  </button>
                  <button
                    onClick={() => {
                      dispatch(setSelectedEvent(tasks[0]));
                      dispatch(setAllTasks(false));
                    }}
                  >
                    {" "}
                    Swipe{" "}
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
