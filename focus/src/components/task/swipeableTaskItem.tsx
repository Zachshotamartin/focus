/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import styles from "./swipeableTaskItem.module.css";
import { useSelector, useDispatch } from "react-redux";
import { updateGPTConversation } from "../../reducers/eventsSlice";
const SwipeableTaskItem = (props: any) => {
  const dispatch = useDispatch();
  const task = useSelector((state: any) => state.events.selectedEvent);
  const taskGPTConversation = useSelector(
    (state: any) => state.events.taskGPTConversation
  );
  const handleNext = props.handleNext;
  const handleDelete = props.handleDelete;
  const [askGPTInput, setAskGPTInput] = useState("");
  const [history, setHistory] = useState<
    { id: string; conversation: string[][] }[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log(taskGPTConversation);
    setHistory(
      taskGPTConversation.filter(
        (curTask: { id: any }) => curTask.id === task.id
      )
    );
  }, [taskGPTConversation, task]);

  const handleAskGPT = async (title: string) => {
    try {
      const lastResponseIndex = history[0]?.conversation?.length - 1;
      const response = await fetch("http://localhost:8080/task/ai-suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: history[0]?.conversation,
          askGPTInput,
          title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI suggestion");
      }

      // Handle the streaming response
      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let responseText = "";

      // Function to add a delay for each character to simulate typing
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      let suggestion = "";
      // Read the stream in chunks
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });
        responseText += chunk;

        try {
          const parsedResponse = JSON.parse(responseText);

          if (parsedResponse.success && parsedResponse.suggestion) {
            suggestion = parsedResponse.suggestion;

            // Simulate typing by updating the suggestion one character at a time
            for (let i = 0; i < suggestion.length; i++) {
              // const character = suggestion[i];
              await delay(10); // Adjust delay for typing speed (e.g., 50ms per character)

              // Update the UI with the current portion of the suggestion
              dispatch(
                updateGPTConversation({
                  taskId: task.id,
                  message: [
                    ...history[0].conversation.slice(0, lastResponseIndex + 1),
                    [askGPTInput, suggestion.slice(0, i + 1)],
                  ],
                })
              );
            }
            break; // Exit the loop after fully displaying the suggestion
          }
        } catch (error) {
          console.log(error);
          // Handle partial response (streaming doesn't always produce valid JSON)
          // Continue accumulating the responseText until it's valid JSON
          console.log("Accumulating response", responseText);
        }
      }

      setAskGPTInput(""); // Clear input field after sending request
    } catch (error) {
      console.error("Error with streaming response:", error);
    }
  };

  const title = task.title;
  //const description = task.description;
  const deadline = task.extendedProperties.private.deadline;
  const estimatedDuration = task.extendedProperties.private.estimatedDuration;
  return (
    <div className={styles.taskContainer}>
      <div className={styles.infoContainer}>
        <h3 className={styles.taskTitle}>{title}</h3>
        Deadline:{" "}
        {new Date(deadline).toLocaleString("en-US", {
          weekday: "long", // "Monday"
          year: "numeric", // "2025"
          month: "long", // "January"
          day: "numeric", // "24"
          hour: "2-digit", // "08"
          minute: "2-digit", // "46"
          hour12: true, // "AM/PM"
        })}
        <p className={styles.taskEstimatedDuration}>
          Estimated Duration: {estimatedDuration} hours
        </p>
        <div className={styles.buttonContainer}>
          <button onClick={handleNext}>Next Task</button>
          <button
            onClick={() => {
              handleDelete();
              console.log("task deleted");
            }}
          >
            Completed Task
          </button>
        </div>
      </div>
      <div className={styles.askGPTContainer}>
        <div className={styles.askGPTResponse}>
          {history[0]?.conversation.map((line, index) => (
            <div key={index}>
              <p className={styles.askGPTQuestion}>{line[0]}</p>
              <p className={styles.askGPTAnswer}>{line[1]}</p>
            </div>
          ))}
        </div>
        <input
          className={styles.askGPTInput}
          ref={inputRef}
          placeholder="Ask for tips..."
          onChange={(e) => {
            setAskGPTInput(e.target.value);
          }}
          value={askGPTInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAskGPT(title);
            }
          }}
        />
      </div>
    </div>
  );
};

export default SwipeableTaskItem;
