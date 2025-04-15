import React, { useState } from "react";
import styles from "./confirmationDialog.module.css";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: (neverAskAgain: boolean) => void;
  onCancel: () => void;
  title: string;
  message: string;
  position: { x: number; y: number };
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  position,
}) => {
  const [neverAskAgain, setNeverAskAgain] = useState(false);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div
        className={styles.dialog}
        style={{
          position: "fixed",
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
      >
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        <div className={styles.checkbox}>
          <input
            type="checkbox"
            id="neverAskAgain"
            checked={neverAskAgain}
            onChange={(e) => setNeverAskAgain(e.target.checked)}
          />
          <label htmlFor="neverAskAgain">Don't ask again</label>
        </div>

        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={styles.confirmButton}
            onClick={() => onConfirm(neverAskAgain)}
          >
            Move Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
