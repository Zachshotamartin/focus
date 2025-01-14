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
    console.log(task);
    dispatch(setAllTasks(false));
 
  };

  //const description = task.description;
  const deadline = task.extendedProperties.private.deadline;
  const estimatedDuration = task.extendedProperties.private.estimatedDuration;
  return (
    <div className={styles.taskContainer} onClick={handleOnClick}>
      <h3 className={styles.taskTitle}>{title}</h3>
      <p className={styles.taskDeadline}>Deadline: {deadline}</p>
      <p className={styles.taskEstimatedDuration}>
        Estimated Duration: {estimatedDuration}
      </p>
    </div>
  );
};

export default Task;
