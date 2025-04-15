/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from "./task.module.css";
import { useDispatch } from "react-redux";
import { setSelectedEvent } from "../../reducers/eventsSlice";
import { setAllTasks } from "../../reducers/pageStateSlice";

const Task = (props: any) => {
  const task = props.task;
  const title = task.title;

  const dispatch = useDispatch();
  const handleOnClick = () => {
    dispatch(setSelectedEvent(task));
    dispatch(setAllTasks(false));
  };

  const deadline = task.extendedProperties?.private?.deadline;
  const estimatedDuration =
    task.extendedProperties?.private?.estimatedDuration || "N/A";

  // Format the deadline to be readable
  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "No deadline set";

  return (
    <div className={styles.taskContainer} onClick={handleOnClick}>
      <h3 className={styles.taskTitle}>{title}</h3>
      <p className={styles.taskDeadline}>Deadline: {formattedDeadline}</p>
      <p className={styles.taskEstimatedDuration}>
        Estimated Duration: {estimatedDuration} hours
      </p>
    </div>
  );
};

export default Task;
