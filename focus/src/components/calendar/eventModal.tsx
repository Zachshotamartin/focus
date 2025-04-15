import React, { useState, useRef, useEffect } from "react";
import styles from "./eventModal.module.css";
import { IoCloseOutline } from "react-icons/io5";
import { AiOutlineClockCircle, AiOutlineEnvironment } from "react-icons/ai";
import { FiUsers, FiAlignLeft } from "react-icons/fi";
import { FaRegCalendarAlt, FaLink } from "react-icons/fa";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: Date;
  endDate: Date;
  onSave: (eventData: EventData) => void;
  position: { x: number; y: number };
}

export interface EventData {
  title: string;
  description: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
  guests?: string[];
  webLink?: string;
  isTask: boolean;
  estimatedDuration?: number;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  onSave,
  position,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState<Date>(startDate);
  const [end, setEnd] = useState<Date>(endDate);
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState<string[]>([]);
  const [webLink, setWebLink] = useState("");
  const [isTask, setIsTask] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState(1);
  const [activeTab, setActiveTab] = useState<"event" | "task">("event");
  const [inputGuest, setInputGuest] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(!allDay);

  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Format date for time picker inputs
    setStart(startDate);
    setEnd(endDate);

    // Auto focus title input when modal opens
    if (isOpen && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, startDate, endDate]);

  useEffect(() => {
    // Close modal when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Update active tab to match isTask state
  useEffect(() => {
    setActiveTab(isTask ? "task" : "event");
  }, [isTask]);

  // Update isTask state when active tab changes
  useEffect(() => {
    setIsTask(activeTab === "task");
  }, [activeTab]);

  const handleAddGuest = () => {
    if (inputGuest && !guests.includes(inputGuest)) {
      setGuests([...guests, inputGuest]);
      setInputGuest("");
    }
  };

  const handleRemoveGuest = (guest: string) => {
    setGuests(guests.filter((g) => g !== guest));
  };

  const handleSave = () => {
    if (!title.trim()) {
      titleInputRef.current?.focus();
      return;
    }

    // Calculate end time for tasks with estimated duration
    let finalEnd = end;
    if (isTask && estimatedDuration > 0) {
      // Add estimatedDuration hours to start time for tasks
      finalEnd = new Date(start.getTime() + estimatedDuration * 60 * 60 * 1000);
    }

    onSave({
      title,
      description,
      start,
      end: finalEnd,
      allDay,
      location,
      guests,
      webLink,
      isTask: activeTab === "task",
      ...(isTask && { estimatedDuration }),
    });

    // Reset form
    setTitle("");
    setDescription("");
    setLocation("");
    setGuests([]);
    setWebLink("");
    setIsTask(false);
    setEstimatedDuration(1);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTimeInput = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const parseTimeInput = (timeString: string, currentDate: Date) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const newDate = new Date(currentDate);
    newDate.setHours(hours, minutes);
    return newDate;
  };

  const formatDateInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const parseDateInput = (dateString: string, currentDate: Date) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const newDate = new Date(currentDate);
    newDate.setFullYear(year, month - 1, day);
    return newDate;
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      style={{
        display: isOpen ? "flex" : "none",
      }}
    >
      <div
        className={styles.modal}
        ref={modalRef}
        style={{
          position: "fixed",
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
      >
        <div className={styles.modalHeader}>
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "event" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("event")}
            >
              Event
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "task" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("task")}
            >
              Task
            </button>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <IoCloseOutline />
          </button>
        </div>

        <div className={styles.modalBody}>
          <input
            ref={titleInputRef}
            type="text"
            className={styles.titleInput}
            placeholder="Add title and time"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className={styles.dateTimeRow}>
            <div className={styles.icon}>
              <FaRegCalendarAlt />
            </div>
            <div className={styles.dateTimeInfo}>
              <span>{formatDate(start)}</span>
              {!allDay && showTimePicker && (
                <>
                  <span className={styles.timeText}>
                    {formatTime(start)} - {formatTime(end)}
                  </span>
                </>
              )}
            </div>
            <button
              className={styles.addTimeButton}
              onClick={() => setShowTimePicker(!showTimePicker)}
            >
              {showTimePicker ? "Hide time" : "Add time"}
            </button>
          </div>

          {showTimePicker && (
            <div className={styles.timePickerRow}>
              <div className={styles.timePickerColumn}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={formatDateInput(start)}
                  onChange={(e) => {
                    const newDate = parseDateInput(e.target.value, start);
                    setStart(newDate);
                  }}
                  className={styles.dateInput}
                />
              </div>
              <div className={styles.timePickerColumn}>
                <label>End Date</label>
                <input
                  type="date"
                  value={formatDateInput(end)}
                  onChange={(e) => {
                    const newDate = parseDateInput(e.target.value, end);
                    setEnd(newDate);
                  }}
                  className={styles.dateInput}
                />
              </div>
            </div>
          )}

          {showTimePicker && !allDay && (
            <div className={styles.timePickerRow}>
              <div className={styles.timePickerColumn}>
                <label>Start Time</label>
                <input
                  type="time"
                  value={formatTimeInput(start)}
                  onChange={(e) => {
                    const newTime = parseTimeInput(e.target.value, start);
                    setStart(newTime);
                  }}
                  className={styles.timeInput}
                />
              </div>
              <div className={styles.timePickerColumn}>
                <label>End Time</label>
                <input
                  type="time"
                  value={formatTimeInput(end)}
                  onChange={(e) => {
                    const newTime = parseTimeInput(e.target.value, end);
                    setEnd(newTime);
                  }}
                  className={styles.timeInput}
                />
              </div>
            </div>
          )}

          {isTask && (
            <div className={styles.optionRow}>
              <div className={styles.icon}>
                <AiOutlineClockCircle />
              </div>
              <div className={styles.durationContainer}>
                <label>Estimated Duration (hours):</label>
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={estimatedDuration}
                  onChange={(e) =>
                    setEstimatedDuration(parseFloat(e.target.value))
                  }
                  className={styles.durationInput}
                />
              </div>
            </div>
          )}

          <div className={styles.optionRow}>
            <div className={styles.icon}>
              <AiOutlineEnvironment />
            </div>
            <input
              type="text"
              className={styles.optionInput}
              placeholder="Add location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className={styles.optionRow}>
            <div className={styles.icon}>
              <FiUsers />
            </div>
            <input
              type="text"
              className={styles.optionInput}
              placeholder="Add guests (email addresses)"
              value={inputGuest}
              onChange={(e) => setInputGuest(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddGuest();
                }
              }}
            />
            {inputGuest && (
              <button className={styles.addButton} onClick={handleAddGuest}>
                Add
              </button>
            )}
          </div>

          {guests.length > 0 && (
            <div className={styles.guestList}>
              {guests.map((guest) => (
                <div key={guest} className={styles.guestChip}>
                  <span>{guest}</span>
                  <button
                    className={styles.removeGuestButton}
                    onClick={() => handleRemoveGuest(guest)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.optionRow}>
            <div className={styles.icon}>
              <FaLink />
            </div>
            <input
              type="url"
              className={styles.optionInput}
              placeholder="Add web link"
              value={webLink}
              onChange={(e) => setWebLink(e.target.value)}
            />
          </div>

          <div className={styles.optionRow}>
            <div className={styles.icon}>
              <FiAlignLeft />
            </div>
            <textarea
              className={styles.descriptionInput}
              placeholder="Add description or attachment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.optionSwitches}>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={allDay}
                onChange={() => setAllDay(!allDay)}
              />
              <span className={styles.slider}></span>
            </label>
            <span>All day</span>
          </div>
          <button className={styles.saveButton} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
