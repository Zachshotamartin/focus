/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import SwipeableTaskItem from "../task/swipeableTaskItem";
import {
  removeCalendarEvent,
  removeTask,
  setSelectedEvent,
} from "../../reducers/eventsSlice";
import styles from "./swipeableList.module.css";

const SwipeableList = () => {
  const tasks = useSelector((state: any) => state.events.tasks);
  const selectedEvent = useSelector((state: any) => state.events.selectedEvent);
  console.log("selectedEvent", selectedEvent);
  const dispatch = useDispatch();

  const [shownTaskIndex, setShownTaskIndex] = useState(0);
  const [viewTasks, setViewTasks] = useState(tasks);

  useEffect(() => {
    console.log("selectedEvent", selectedEvent);
    if (!selectedEvent) {
      dispatch(setSelectedEvent(tasks[0]));
      setShownTaskIndex(0);
    }
  }, [dispatch, selectedEvent, tasks]);
  useEffect(() => {
    setViewTasks(tasks);
  }, [tasks]);

  const handleDelete = async () => {
    if (viewTasks[shownTaskIndex]) {
      const token = localStorage.getItem("user_token");
      console.log("Token:", token);
      if (token) {
        try {
          const response = await fetch(
            `https://focus-447201.wl.r.appspot.com/calendar/event/${tasks[shownTaskIndex].id}`,
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
            dispatch(removeTask(viewTasks[shownTaskIndex]));
            dispatch(setSelectedEvent(tasks(viewTasks[shownTaskIndex])));
            dispatch(removeCalendarEvent());
            setShownTaskIndex((prev) =>
              prev >= viewTasks.length - 1 ? 0 : prev
            );
          } else {
            console.error("Failed to delete event");
          }
        } catch (error) {
          console.error("Error deleting event:", error);
        }
      }
    }
  };

  const handleRandomNextTask = () => {
    let randomIndex = Math.floor(Math.random() * viewTasks.length);
    while (randomIndex === shownTaskIndex) {
      randomIndex = Math.floor(Math.random() * viewTasks.length);
    }
    setShownTaskIndex(randomIndex);
    dispatch(setSelectedEvent(viewTasks[randomIndex]));
  };

  return (
    <div className={styles.container}>
      {viewTasks.length > 0 ? (
        <SwipeableTaskItem
          task={selectedEvent ? viewTasks[0] : selectedEvent}
          handleNext={handleRandomNextTask}
          handleDelete={handleDelete}
        />
      ) : (
        <p>No tasks available</p>
      )}
    </div>
  );
};

export default SwipeableList;
