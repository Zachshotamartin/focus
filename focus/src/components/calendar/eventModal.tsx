import React, { useState, useRef, useEffect } from "react";
import styles from "./eventModal.module.css";
import { IoCloseOutline } from "react-icons/io5";
import { AiOutlineClockCircle, AiOutlineEnvironment } from "react-icons/ai";
import { FiUsers, FiVideo, FiAlignLeft } from "react-icons/fi";
import { FaRegCalendarAlt } from "react-icons/fa";

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
  isTask: boolean;
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
  const [isTask, setIsTask] = useState(false);
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

    onSave({
      title,
      description,
      start,
      end,
      allDay,
      location,
      guests,
      isTask: activeTab === "task",
    });

    // Reset form
    setTitle("");
    setDescription("");
    setLocation("");
    setGuests([]);
    setIsTask(false);
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
              placeholder="Add guests"
              value={inputGuest}
              onChange={(e) => setInputGuest(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddGuest();
                }
              }}
            />
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
              <FiVideo />
            </div>
            <div className={styles.optionText}>
              Add Google Meet video conferencing
            </div>
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
