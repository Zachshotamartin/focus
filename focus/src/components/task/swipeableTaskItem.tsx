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
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<
    { id: string; conversation: string[][] }[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (taskGPTConversation && task) {
      setHistory(
        taskGPTConversation.filter(
          (curTask: { id: any }) => curTask.id === task.id
        )
      );
    }
  }, [taskGPTConversation, task]);

  const handleAskGPT = async (title: string) => {
    if (!askGPTInput.trim() || isGenerating) return;

    try {
      setIsGenerating(true);
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
              await delay(10); // Adjust delay for typing speed

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
          // Continue accumulating the responseText until it's valid JSON
          console.log("Accumulating response");
        }
      }

      setAskGPTInput(""); // Clear input field after sending request
    } catch (error) {
      console.error("Error with streaming response:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!task) {
    return <div className={styles.taskContainer}>No task selected</div>;
  }

  const title = task.title;
  const deadline = task.extendedProperties?.private?.deadline;
  const estimatedDuration =
    task.extendedProperties?.private?.estimatedDuration || "N/A";

  // Format the deadline date
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
    <div className={styles.taskContainer}>
      <div className={styles.infoContainer}>
        <h2 className={styles.taskTitle}>{title}</h2>

        <div className={styles.taskDeadline}>
          <strong>Deadline:</strong> {formattedDeadline}
        </div>

        <div className={styles.taskEstimatedDuration}>
          <strong>Estimated Duration:</strong> {estimatedDuration} hours
        </div>

        <div className={styles.buttonContainer}>
          <button onClick={handleNext}>Next Task</button>
          <button onClick={handleDelete}>Completed Task</button>
        </div>
      </div>

      <div className={styles.askGPTContainer}>
        <div className={styles.askGPTResponse}>
          {history[0]?.conversation && history[0]?.conversation.length > 0 ? (
            history[0]?.conversation.map((line, index) => (
              <div key={index}>
                <div className={styles.askGPTQuestion}>{line[0]}</div>
                <div className={styles.askGPTAnswer}>{line[1]}</div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              Ask for tips or help with this task
            </div>
          )}
          {isGenerating && (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.inputContainer}>
          <input
            className={styles.askGPTInput}
            ref={inputRef}
            placeholder={
              isGenerating
                ? "Generating response..."
                : "Ask for tips or task guidance..."
            }
            onChange={(e) => setAskGPTInput(e.target.value)}
            value={askGPTInput}
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isGenerating) {
                handleAskGPT(title);
              }
            }}
          />
          {isGenerating && <div className={styles.inputOverlay}></div>}
        </div>
      </div>
    </div>
  );
};

export default SwipeableTaskItem;
