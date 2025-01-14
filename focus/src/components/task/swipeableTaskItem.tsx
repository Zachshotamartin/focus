/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState } from "react";
import styles from "./swipeableTaskItem.module.css";
import { useSelector } from "react-redux";
const SwipeableTaskItem = (props: any) => {
  const task = useSelector((state: any) => state.events.selectedEvent);
  const handleNext = props.handleNext;
  const handleDelete = props.handleDelete;
  // const [askGPTInput, setAskGPTInput] = useState("");

  const title = task.title;
  //const description = task.description;
  const deadline = task.extendedProperties.private.deadline;
  const estimatedDuration = task.extendedProperties.private.estimatedDuration;
  return (
    <div className={styles.taskContainer}>
      <div className={styles.infoContainer}>
        <h3 className={styles.taskTitle}>{title}</h3>
        <p className={styles.taskDeadline}>Deadline: {deadline}</p>
        <p className={styles.taskEstimatedDuration}>
          Estimated Duration: {estimatedDuration}
        </p>

        <div className={styles.buttonContainer}>
          <button onClick={handleNext}>Next Task</button>
          <button onClick={handleDelete}>Completed Task</button>
        </div>
      </div>
      {/* <div className={styles.askGPTContainer}>
        <textarea
          className={styles.askGPTInput}
          placeholder="Ask tips..."
          onChange={(e) => {
            setAskGPTInput(e.target.value);
          }}
          value={askGPTInput}
        />
      </div> */}
    </div>
  );
};

export default SwipeableTaskItem;
