/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";
import styles from "./swipeableTaskItem.module.css";
import { useSelector } from "react-redux";
const SwipeableTaskItem = (props: any) => {
  const task = useSelector((state: any) => state.events.selectedEvent);
  const handleNext = props.handleNext;
  const handleDelete = props.handleDelete;
  const [askGPTInput, setAskGPTInput] = useState("");
  const [history, setHistory] = useState<string[][]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleAskGPT = async (title: string) => {
    try {
      const currentResponseIndex = history.length;
      const response = await fetch("http://localhost:8080/task/ai-suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ history, askGPTInput, title }),
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
              await delay(25); // Adjust delay for typing speed (e.g., 50ms per character)

              // Update the UI with the current portion of the suggestion
              setHistory((prevHistory) => [
                ...prevHistory.filter(
                  (_questionAnswer: string[], index: number) =>
                    index !== currentResponseIndex
                ),
                [askGPTInput, suggestion.slice(0, i + 1)], // Display progressively more of the suggestion
              ]);
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
        <p className={styles.taskDeadline}>Deadline: {deadline}</p>
        <p className={styles.taskEstimatedDuration}>
          Estimated Duration: {estimatedDuration}
        </p>

        <div className={styles.buttonContainer}>
          <button onClick={handleNext}>Next Task</button>
          <button onClick={handleDelete}>Completed Task</button>
        </div>
      </div>
      <div className={styles.askGPTContainer}>
        <div className={styles.askGPTResponse}>
          {history.map((line, index) => (
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
