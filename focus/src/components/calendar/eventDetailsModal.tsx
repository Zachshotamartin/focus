import React from "react";
import styles from "./eventModal.module.css";
import { IoCloseOutline } from "react-icons/io5";
import {
  AiOutlineEnvironment,
  AiOutlineClockCircle,
  AiOutlineCalendar,
} from "react-icons/ai";
import {
  FiUsers,
  FiVideo,
  FiAlignLeft,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onEdit: () => void;
  onDelete: () => void;
  position: { x: number; y: number };
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete,
  position,
}) => {
  if (!isOpen || !event) return null;

  const isTask =
    event.extendedProperties?.private?.deadline &&
    event.extendedProperties?.private?.estimatedDuration;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={styles.modalOverlay}
      style={{
        display: isOpen ? "flex" : "none",
      }}
    >
      <div
        className={styles.modal}
        style={{
          position: "fixed",
          top: `${position.y}px`,
          left: `${position.x}px`,
          maxWidth: "450px",
        }}
      >
        <div className={styles.modalHeader}>
          <div className={styles.tabContainer}>
            <div className={`${styles.tabButton} ${styles.activeTab}`}>
              {isTask ? "Task" : "Event"}
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <IoCloseOutline />
          </button>
        </div>

        <div className={styles.modalBody}>
          <h2 className={styles.eventTitle}>{event.title}</h2>

          <div className={styles.dateTimeRow}>
            <div className={styles.icon}>
              <AiOutlineCalendar />
            </div>
            <div className={styles.dateTimeInfo}>
              {event.start && (
                <div>
                  <span>{formatDate(event.start)}</span>
                  {!event.allDay && event.start && (
                    <span className={styles.timeText}>
                      {formatTime(event.start)}
                      {event.end && ` - ${formatTime(event.end)}`}
                    </span>
                  )}
                  {event.allDay && (
                    <span className={styles.timeText}>All day</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {event.location && (
            <div className={styles.detailRow}>
              <div className={styles.icon}>
                <AiOutlineEnvironment />
              </div>
              <div className={styles.detailText}>{event.location}</div>
            </div>
          )}

          {isTask && (
            <div className={styles.detailRow}>
              <div className={styles.icon}>
                <AiOutlineClockCircle />
              </div>
              <div className={styles.detailText}>
                Estimated duration:{" "}
                {event.extendedProperties.private.estimatedDuration} minutes
              </div>
            </div>
          )}

          {event.description && (
            <div className={styles.detailRow}>
              <div className={styles.icon}>
                <FiAlignLeft />
              </div>
              <div className={styles.detailText}>{event.description}</div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.actionButtons}>
            <button className={styles.editButton} onClick={onEdit}>
              <FiEdit2 /> Edit
            </button>
            <button className={styles.deleteButton} onClick={onDelete}>
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
