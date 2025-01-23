import styles from "./login.module.css";

const Login = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:8080/login"; // Redirect to backend for OAuth
  };

  return (
    <button onClick={handleLogin} className={styles.loginWithGoogleButton}>
      Login with Google
    </button>
  );
};

export default Login;
