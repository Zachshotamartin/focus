import styles from "./settings.module.css";

import { useState } from "react";
const Settings = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.settings}>
      <button className={styles.settingsTitle} onClick={() => setOpen(!open)}>
        Settings
      </button>
      {open && (
        <p className={styles.settingsContent}>
          settings currently under construction!
        </p>
      )}
    </div>
  );
};

export default Settings;
