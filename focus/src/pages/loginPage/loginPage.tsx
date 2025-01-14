import Login from "../../components/login/login";
import styles from "./loginPage.module.css";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.loginPage}>
      <div className={styles.titleContainer}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h1 className={styles.title}>please... Focus</h1>
      </div>
      <Login />
      <button
        className={styles.privacyPolicyButton}
        onClick={() => navigate("/privacy-policy")}
      >
        View Privacy Policy
      </button>
    </div>
  );
};

export default LoginPage;
