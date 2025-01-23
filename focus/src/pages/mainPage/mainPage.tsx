/* eslint-disable @typescript-eslint/no-explicit-any */
import GoogleCalendar from "../../components/calendar/calendar";
import LeftBar from "../../components/leftBar/leftBar";
import styles from "./mainPage.module.css";
import { useDispatch, useSelector } from "react-redux";
import { addCalendarEvent, addTask } from "../../reducers/eventsSlice";
import { useEffect, useState } from "react";

const MainPage = () => {
  const dispatch = useDispatch();
  const loadingState = useSelector((state: any) => state.events.loading);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [loadingState]);

  const getAIScheduleSuggestion = async (
    freeSlots: any[],
    eventDetails: any
  ) => {
    try {
      const response = await fetch(
        "http://localhost:8080/schedule/ai-suggest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ freeSlots, eventDetails }),
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log("AI Scheduling Suggestion:", data.suggestion);
        return data.suggestion;
      } else {
        console.error("Failed to get AI suggestion:", data);
      }
    } catch (error) {
      console.error("Error calling AI scheduling API:", error);
    }
  };

  const generateDates = async (eventDetails: any, busy: any) => {
    console.log("eventDetails", eventDetails);
    const deadline = eventDetails.extendedProperties.private.deadline;
    const estimatedDurationMs =
      eventDetails.extendedProperties.private.estimatedDuration * 60 * 1000; // Convert duration to milliseconds
    console.log("busy", busy);
    // eslint-disable-next-line prefer-const
    const sortedBusyPeriods = [...busy].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
    console.log("sortedBusyPeriods", sortedBusyPeriods);
    const freeSlots: { start: Date; end: Date }[] = [];
    let currentTime = new Date(); // Current time

    // Generate free slots
    for (const period of sortedBusyPeriods) {
      const busyStart = new Date(period.start);
      const busyEnd = new Date(period.end);

      if (currentTime < busyStart) {
        freeSlots.push({
          start: currentTime,
          end: busyStart,
        });
        console.log("freeSlots", freeSlots);
      }

      // Move the current time to the end of the busy period
      currentTime = busyEnd;
    }

    // Add a final free slot if there's time before the deadline
    console.log("checking final slot");
    console.log("currentTime", currentTime);
    console.log("deadline", new Date(deadline));
    console.log("deadline", deadline);
    if (currentTime < new Date(deadline)) {
      freeSlots.push({
        start: currentTime,
        end: new Date(deadline),
      });
      console.log("current Time < deadline");
      console.log("freeSlots", freeSlots);
    }
    const suggestedTime = await getAIScheduleSuggestion(
      freeSlots,
      eventDetails
    );
    console.log("suggestedTime", suggestedTime);
    if (suggestedTime) {
      return {
        ...eventDetails,
        start: {
          dateTime: new Date(suggestedTime).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(
            new Date(suggestedTime).getTime() + estimatedDurationMs * 60
          ).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };
    }

    for (const slot of freeSlots) {
      const slotStart = new Date(slot.start).getTime();
      const slotEnd = new Date(slot.end).getTime();

      if (slotEnd - slotStart >= estimatedDurationMs) {
        const eventStart = new Date(slotStart);
        const eventEnd = new Date(eventStart.getTime() + estimatedDurationMs);

        return {
          ...eventDetails,
          start: {
            dateTime: eventStart.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: eventEnd.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };
      }
    }

    // If no suitable slot is found, return null
    console.log("No suitable slot found");
    return null;
  };

  const handleEventSubmission = async (props: any) => {
    let eventDetails = props.formattedEvent;
    const busy = props.freeBusy;
    try {
      const token = localStorage.getItem("user_token"); // Replace with your logic to retrieve the access token
      console.log("Token:", token);
      if (!eventDetails.start || !eventDetails.end) {
        eventDetails = await generateDates(eventDetails, busy);
      }
      if (!eventDetails.start && !eventDetails.end) {
        alert("no time slot found");
        return;
      }
      const requestBody = {
        eventDetails,
      };

      console.log("Request Body:", requestBody); // Log the request body to check

      const response = await fetch("http://localhost:8080/calendar/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // Ensure the Authorization header is set properly
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Response Data:", responseData);

        const event = {
          id: responseData.event.id, // Use the id from the backend response
          title: responseData.event.summary,
          start:
            responseData.event.start.dateTime || responseData.event.start.date,
          end: responseData.event.end.dateTime || responseData.event.end.date,
          allDay: !responseData.event.start.dateTime,
          description: responseData.event.description,
          extendedProperties: responseData.event.extendedProperties,
        };

        dispatch(addCalendarEvent(event));
        console.log("Event", event);
        dispatch(addTask(event));

        console.log("Event added successfully");
        alert("Event added successfully!");
      } else {
        console.error("Failed to add event");
        alert("Failed to add event");
      }
    } catch (error) {
      console.error("Error submitting event:", error);
      alert("Error submitting event");
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className={styles.mainPage}>
      <LeftBar onSubmitEvent={handleEventSubmission} />
      <GoogleCalendar />
    </div>
  );
};

export default MainPage;
