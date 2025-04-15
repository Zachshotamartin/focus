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
import Settings from "../settings/settings";
import EventModal, { EventData } from "./eventModal";
import EventDetailsModal from "./eventDetailsModal";
import ConfirmationDialog from "./confirmationDialog";
import { FaCalendarPlus } from "react-icons/fa";

import {
  setCalendarEvents,
  setSelectedEvent,
  setTasks,
  addCalendarEvent,
  addTask,
  updateCalendarEvent,
} from "../../reducers/eventsSlice";

import { setAllTasks } from "../../reducers/pageStateSlice";

function GoogleCalendar() {
  const dispatch = useDispatch();
  const userData = JSON.parse(localStorage.getItem("user_info") || "{}");
  const [events, setEvents] = useState<any[]>([]);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStartDate, setModalStartDate] = useState<Date>(new Date());
  const [modalEndDate, setModalEndDate] = useState<Date>(new Date());
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEventState] = useState<any>(null);
  const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });

  // Confirmation dialog state
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [eventToMove, setEventToMove] = useState<any>(null);
  const [newEventDates, setNewEventDates] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [confirmPosition, setConfirmPosition] = useState({ x: 0, y: 0 });

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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        event.target &&
        !(event.target as Element).closest("#userSettings") &&
        !(event.target as Element).closest("#profileImage")
      ) {
        setUserSettingsOpen(false);
        console.log("hello");
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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
              console.log("event", event);
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

  // Check localStorage for 'dontAskBeforeMoving' preference
  useEffect(() => {
    const dontAsk = localStorage.getItem("dontAskBeforeMoving") === "true";
    if (dontAsk) {
      console.log("User preference: not asking before moving events");
    }
  }, []);

  const handleSelect = ({ start, end, jsEvent }: any) => {
    // Set modal position based on click event
    if (jsEvent) {
      const x = jsEvent.clientX;
      const y = jsEvent.clientY;

      // Position the modal near the click but ensure it's visible
      const safeX = Math.min(x, window.innerWidth - 420); // 420px = modal width + margin
      const safeY = Math.min(y, window.innerHeight - 300); // Rough estimate for visibility

      setModalPosition({ x: safeX, y: safeY });
    } else {
      // Fallback position if jsEvent is not available
      setModalPosition({ x: 50, y: 50 });
    }

    setModalOpen(true);
    setModalStartDate(start);
    setModalEndDate(end);
  };

  const handleEventClick = ({ event, jsEvent }: any) => {
    // Set position for details modal near click position
    if (jsEvent) {
      const x = Math.min(jsEvent.clientX, window.innerWidth - 450);
      const y = Math.min(jsEvent.clientY, window.innerHeight - 300);
      setDetailsPosition({ x, y });
    }

    // Store the selected event locally for the details modal
    setSelectedEventState(event);

    // Also dispatch to Redux for other components
    dispatch(setSelectedEvent(event));

    // Open the details modal
    setDetailsModalOpen(true);
  };

  const handleEditEvent = () => {
    // Close details modal
    setDetailsModalOpen(false);

    // Here you would open the edit modal with the event data
    // This would be implemented in a future feature
    console.log("Edit event:", selectedEvent);
  };

  const handleDeleteEvent = async () => {
    // Close details modal
    setDetailsModalOpen(false);

    if (!selectedEvent) return;

    // Here you would add code to delete the event
    // This would be implemented in a future feature
    console.log("Delete event:", selectedEvent);
  };

  const handleEventDrop = (info: any) => {
    const { event, jsEvent } = info;

    // Get the dragged event
    const droppedEvent = event;

    // Get the new start and end dates
    const newStart = droppedEvent.start;
    const newEnd = droppedEvent.end || new Date(newStart.getTime() + 3600000); // Add 1 hour if no end time

    // Calculate position for confirmation dialog
    const x = Math.min(jsEvent.clientX, window.innerWidth - 350);
    const y = Math.min(jsEvent.clientY, window.innerHeight - 200);
    setConfirmPosition({ x, y });

    // Store event info for confirmation
    setEventToMove(droppedEvent);
    setNewEventDates({ start: newStart, end: newEnd });

    // Check if user prefers not to see confirmation
    const dontAsk = localStorage.getItem("dontAskBeforeMoving") === "true";

    if (dontAsk) {
      // If user doesn't want to be asked, update directly
      updateEventDates(droppedEvent, newStart, newEnd);
    } else {
      // Otherwise show confirmation dialog
      setConfirmationOpen(true);

      // For now, revert the drag so we can handle it ourselves after confirmation
      info.revert();
    }
  };

  const updateEventDates = async (event: any, newStart: Date, newEnd: Date) => {
    // Create updated event object for the UI
    const updatedEvent = {
      ...event,
      start: newStart,
      end: newEnd,
    };

    // Update Redux store and local state
    dispatch(updateCalendarEvent(updatedEvent));

    // If it was the selected event, update the selected event state
    if (selectedEvent && selectedEvent.id === event.id) {
      setSelectedEventState(updatedEvent);
    }

    // Update events list
    setEvents(events.map((e) => (e.id === event.id ? updatedEvent : e)));

    // Send update to server
    const token = localStorage.getItem("user_token");
    if (!token) {
      alert("User is not authenticated.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/calendar/event/${event.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start: {
              dateTime: event.allDay ? undefined : newStart.toISOString(),
              date: event.allDay
                ? newStart.toISOString().split("T")[0]
                : undefined,
            },
            end: {
              dateTime: event.allDay ? undefined : newEnd.toISOString(),
              date: event.allDay
                ? newEnd.toISOString().split("T")[0]
                : undefined,
            },
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to update event on server");
        // You might want to revert the UI change here
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleConfirmMove = (neverAskAgain: boolean) => {
    if (!eventToMove || !newEventDates) return;

    // Update the event with new dates
    updateEventDates(eventToMove, newEventDates.start, newEventDates.end);

    // If user checked "don't ask again", store this preference
    if (neverAskAgain) {
      localStorage.setItem("dontAskBeforeMoving", "true");
    }

    // Close the confirmation dialog
    setConfirmationOpen(false);
    setEventToMove(null);
    setNewEventDates(null);
  };

  const handleCancelMove = () => {
    // Close dialog without making changes
    setConfirmationOpen(false);
    setEventToMove(null);
    setNewEventDates(null);
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

  const handleSaveEvent = async (eventData: EventData) => {
    // Create event object
    const newEvent = {
      id: `temp-${Date.now()}`, // Temporary ID until server assigns one
      title: eventData.title,
      start: eventData.start,
      end: eventData.end,
      allDay: eventData.allDay,
      description: eventData.description,
      location: eventData.location,
      extendedProperties: {
        private: {
          ...(eventData.isTask && {
            deadline: eventData.end.toISOString(),
            estimatedDuration: "60", // Default duration in minutes
          }),
        },
      },
    };

    // Add to local state temporarily
    setEvents((prevEvents) => [...prevEvents, newEvent]);

    // Send to server
    const token = localStorage.getItem("user_token");
    if (!token) {
      alert("User is not authenticated.");
      return;
    }

    try {
      // Format event data for API
      const apiEventData = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.allDay
            ? undefined
            : eventData.start.toISOString(),
          date: eventData.allDay
            ? eventData.start.toISOString().split("T")[0]
            : undefined,
          timeZone: "America/Los_Angeles",
        },
        end: {
          dateTime: eventData.allDay ? undefined : eventData.end.toISOString(),
          date: eventData.allDay
            ? eventData.end.toISOString().split("T")[0]
            : undefined,
          timeZone: "America/Los_Angeles",
        },
        location: eventData.location,
        extendedProperties: {
          private: {
            ...(eventData.isTask && {
              deadline: eventData.end.toISOString(),
              estimatedDuration: "60", // Default duration in minutes
            }),
          },
        },
      };

      const response = await fetch("http://localhost:8080/calendar/event", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiEventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding event:", errorData);
        alert("Failed to add event to calendar.");
        return;
      }

      const data = await response.json();

      // Create final event object with server-assigned ID
      const serverEvent = {
        id: data.event.id,
        title: data.event.summary,
        start: data.event.start.dateTime || data.event.start.date,
        end: data.event.end.dateTime || data.event.end.date,
        allDay: !data.event.start.dateTime,
        description: data.event.description,
        location: data.event.location,
        extendedProperties: data.event.extendedProperties,
      };

      // Update local state with server event
      setEvents((prevEvents) =>
        prevEvents.map((e) => (e.id === newEvent.id ? serverEvent : e))
      );

      // Add to Redux store
      dispatch(addCalendarEvent(serverEvent));

      // If it's a task, also add to tasks
      if (eventData.isTask) {
        dispatch(addTask(serverEvent));
      }

      console.log("Event added successfully:", serverEvent);
    } catch (error) {
      console.error("Error submitting event:", error);
      alert("Error submitting event");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && naturalLanguageInput.trim()) {
      handleQuickAdd();
    }
  };

  return (
    <div className={styles.calendar}>
      {isCalendarView && (
        <>
          <div className={styles.topRow}>
            <div className={styles.quickAdd}>
              <FaCalendarPlus className={styles.inputIcon} />
              <input
                className={styles.naturalLanguageInput}
                placeholder="Add event with natural language (e.g., 'Meeting tomorrow at 2pm')"
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className={styles.button}
                onClick={handleQuickAdd}
                disabled={!naturalLanguageInput.trim()}
              >
                Add
              </button>
            </div>
            <div className={styles.profileContainer}>
              {userData && userData.email ? (
                <>
                  {userData.picture && (
                    <img
                      src={userData.picture}
                      id="profileImage"
                      alt="User Profile"
                      className={styles.profileImage}
                      onClick={() => setUserSettingsOpen(!userSettingsOpen)}
                    />
                  )}
                </>
              ) : (
                <p>Loading user information...</p>
              )}
            </div>
            {userSettingsOpen && (
              <div className={styles.userSettings} id="userSettings">
                {userData && userData.email && (
                  <p className={styles.email}>{userData.email}</p>
                )}

                {userData.picture && (
                  <img
                    src={userData.picture}
                    alt="User Profile"
                    className={styles.settingsPicture}
                  />
                )}
                {userData.name && (
                  <p className={styles.name}>Hi, {userData.name}!</p>
                )}
                <div className={styles.options}>
                  <Settings />
                  <Logout />
                </div>
              </div>
            )}
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
              events={events}
              selectable={true}
              select={handleSelect}
              eventClick={handleEventClick}
              editable={true}
              eventDrop={handleEventDrop}
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
                          id="profileImage"
                          alt="User Profile"
                          className={styles.profileImage}
                          onClick={() => setUserSettingsOpen(!userSettingsOpen)}
                        />
                      )}
                    </>
                  ) : (
                    <p>Loading user information...</p>
                  )}
                </div>
                {userSettingsOpen && (
                  <div className={styles.userSettings} id="userSettings">
                    {userData && userData.email && (
                      <p className={styles.email}>{userData.email}</p>
                    )}

                    {userData.picture && (
                      <img
                        src={userData.picture}
                        alt="User Profile"
                        className={styles.settingsPicture}
                      />
                    )}
                    {userData.name && (
                      <p className={styles.name}>Hi, {userData.name}!</p>
                    )}
                    <div className={styles.options}>
                      <Settings />
                      <Logout />
                    </div>
                  </div>
                )}
              </div>
              {showAllTasks && (
                <ul className={styles.taskList} style={{ paddingTop: "1rem" }}>
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
      {modalOpen && modalStartDate && modalEndDate && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          startDate={modalStartDate}
          endDate={modalEndDate}
          onSave={handleSaveEvent}
          position={modalPosition}
        />
      )}
      {detailsModalOpen && selectedEvent && (
        <EventDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          event={selectedEvent}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          position={detailsPosition}
        />
      )}
      {confirmationOpen && (
        <ConfirmationDialog
          isOpen={confirmationOpen}
          onConfirm={handleConfirmMove}
          onCancel={handleCancelMove}
          title="Move Event"
          message={`Are you sure you want to move "${
            eventToMove?.title
          }" to ${newEventDates?.start.toLocaleDateString()}?`}
          position={confirmPosition}
        />
      )}
    </div>
  );
}

export default GoogleCalendar;
