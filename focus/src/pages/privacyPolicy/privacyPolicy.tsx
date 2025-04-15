import styles from "./privacyPolicy.module.css";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.privacyPolicy}>
      <h1 className={styles.heading}>Privacy Policy</h1>
      <p className={styles.date}>
        <strong>Effective Date:</strong> 01/13/2025
      </p>

      <p className={styles.intro}>
        Thank you for using <strong>Focus</strong>, a self-planning calendar app
        designed to help you manage your time effectively. Your privacy is
        important to us. This Privacy Policy explains how Focus handles your
        data.
      </p>

      <h2 className={styles.subHeading}>1. Information We Access</h2>
      <p className={styles.text}>
        When you use Focus, we access limited personal information from your
        Google account through the Google Calendar API to provide app
        functionality. Specifically, we may access:
      </p>
      <ul className={styles.list}>
        <li>Your email address.</li>
        <li>Your profile picture (if available).</li>
        <li>
          Calendar events, including their details (e.g., title, time, and
          description).
        </li>
      </ul>

      <h2 className={styles.subHeading}>2. How We Use Your Information</h2>
      <p className={styles.text}>
        <strong>Display Only:</strong> Focus only displays your email and
        profile picture within the app. This information is not stored or shared
        with any external parties.
      </p>
      <p className={styles.text}>
        <strong>Calendar Events:</strong> We provide functionality to add and
        delete calendar events within the app, but we cannot add or delete
        entire calendars.
      </p>
      <p className={styles.text}>
        <strong>Local Processing:</strong> All data used in Focus is processed
        locally on your device and is not stored on our servers.
      </p>

      <h2 className={styles.subHeading}>3. Information We Do Not Collect</h2>
      <p className={styles.text}>
        - We do not collect, store, or share any of your personal information,
        including calendar data, email, or profile picture.
        <br />- Focus does not track your activity or store cookies or analytics
        data.
      </p>

      <h2 className={styles.subHeading}>4. Third-Party Services</h2>
      <p className={styles.text}>
        Focus uses the Google Calendar API to interact with your Google
        Calendar. By using Focus, you agree to Google's
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Privacy Policy
        </a>
        .
      </p>

      <h2 className={styles.subHeading}>5. Your Control Over Data</h2>
      <p className={styles.text}>
        <strong>Permissions:</strong> You can revoke Focus's access to your
        Google account at any time through your Google account settings.
      </p>
      <p className={styles.text}>
        <strong>Deletion:</strong> If you uninstall the app, all locally cached
        data will be removed from your device.
      </p>

      <h2 className={styles.subHeading}>6. Security</h2>
      <p className={styles.text}>
        We prioritize the security of your data. Since we do not store any of
        your personal information, there is minimal risk associated with using
        Focus. All interactions with Google services occur over secure
        connections.
      </p>

      <h2 className={styles.subHeading}>7. Changes to This Privacy Policy</h2>
      <p className={styles.text}>
        We may update this Privacy Policy from time to time. If changes are
        made, we will notify users by updating the "Effective Date" at the top
        of this policy.
      </p>

      <h2 className={styles.subHeading}>8. Contact Us</h2>
      <p className={styles.text}>
        If you have any questions about this Privacy Policy or Focus, please
        contact us at:
        <br />
        <strong>Email:</strong> zachsm999@gmail.com
      </p>

      <p className={styles.conclusion}>
        This Privacy Policy ensures transparency and protects your privacy while
        using Focus. Thank you for trusting us to help manage your schedule!
      </p>
      <button className={styles.backButton} onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
};

export default PrivacyPolicy;
