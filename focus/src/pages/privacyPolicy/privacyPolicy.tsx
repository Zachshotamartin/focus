import styles from "./privacyPolicy.module.css";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.privacyPolicy}>
      <h1 className={styles.heading}>Privacy Policy</h1>
      <p className={styles.date}>
        <strong>Effective Date:</strong> January 15, 2024
      </p>

      <p className={styles.intro}>
        Thank you for using <strong>Focus</strong>, a smart calendar and task
        management app designed to help you efficiently organize your schedule.
        Your privacy is important to us. This Privacy Policy explains how Focus
        handles your data and ensures your information remains secure.
      </p>

      <h2 className={styles.subHeading}>1. Information We Access</h2>
      <p className={styles.text}>
        When you use Focus, we access limited personal information from your
        Google account through the Google Calendar API to provide app
        functionality. Specifically, we may access:
      </p>
      <ul className={styles.list}>
        <li>Your email address and name for account identification.</li>
        <li>
          Your profile picture (if available) for displaying in the app
          interface.
        </li>
        <li>
          Calendar events, including their details (title, time, description,
          location, and guests).
        </li>
        <li>Free/busy information to help with our auto-scheduling feature.</li>
      </ul>

      <h2 className={styles.subHeading}>2. How We Use Your Information</h2>
      <p className={styles.text}>
        <strong>Display and Functionality:</strong> Focus displays your profile
        information within the app to personalize your experience. This
        information is not stored on our servers or shared with third parties.
      </p>
      <p className={styles.text}>
        <strong>Calendar Management:</strong> We provide functionality to view,
        add, edit, and delete calendar events within the app, as well as
        auto-schedule events based on your preferences.
      </p>
      <p className={styles.text}>
        <strong>Local Processing:</strong> All data used in Focus is processed
        locally on your device. Any temporary caching is done locally and only
        for the duration of your session.
      </p>
      <p className={styles.text}>
        <strong>AI Features:</strong> If you use our natural language input or
        auto-scheduling features, your inputs may be processed to interpret your
        intentions and create appropriate calendar events. This processing
        occurs locally or through secure API calls.
      </p>

      <h2 className={styles.subHeading}>3. Information We Do Not Collect</h2>
      <p className={styles.text}>We do not:</p>
      <ul className={styles.list}>
        <li>
          Store your personal information, calendar data, or credentials on our
          servers.
        </li>
        <li>Track your activity within the app for advertising purposes.</li>
        <li>
          Share your information with third parties for marketing purposes.
        </li>
        <li>
          Use cookies or similar tracking technologies except where necessary
          for app functionality.
        </li>
      </ul>

      <h2 className={styles.subHeading}>4. Third-Party Services</h2>
      <p className={styles.text}>
        Focus integrates with the following third-party services:
      </p>
      <ul className={styles.list}>
        <li>
          <strong>Google Calendar API:</strong> To interact with your Google
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
        </li>
        <li>
          <strong>OpenAI API:</strong> If applicable, for natural language
          processing. OpenAI maintains its own
          <a
            href="https://openai.com/policies/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Privacy Policy
          </a>
          .
        </li>
      </ul>

      <h2 className={styles.subHeading}>5. Your Control Over Data</h2>
      <p className={styles.text}>
        <strong>Permissions:</strong> You can revoke Focus's access to your
        Google account at any time through your Google account settings under
        "Security" and "Third-party apps with account access."
      </p>
      <p className={styles.text}>
        <strong>Deletion:</strong> When you uninstall the app, all locally
        cached data will be removed from your device. No data remains on our
        servers because we don't store your information.
      </p>

      <h2 className={styles.subHeading}>6. Security</h2>
      <p className={styles.text}>
        We prioritize the security of your data through the following measures:
      </p>
      <ul className={styles.list}>
        <li>
          All interactions with Google services occur over secure HTTPS
          connections.
        </li>
        <li>
          We use OAuth 2.0 for authentication, which means we never see or store
          your Google password.
        </li>
        <li>
          Since we don't store your data on servers, the risk of data breaches
          is minimized.
        </li>
      </ul>

      <h2 className={styles.subHeading}>7. Changes to This Privacy Policy</h2>
      <p className={styles.text}>
        We may update this Privacy Policy periodically to reflect changes in our
        practices or for legal compliance. If significant changes are made, we
        will notify users by updating the "Effective Date" at the top of this
        policy and possibly through in-app notifications for substantial
        changes.
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
      <button className={styles.backButton} onClick={() => navigate("/")}>
        Back to Home
      </button>
    </div>
  );
};

export default PrivacyPolicy;
