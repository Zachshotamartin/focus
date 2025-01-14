import styles from "./login.module.css";

const Login = () => {
  const handleLogin = () => {
    window.location.href = "https://focus-447201.wl.r.appspot.com/login"; // Redirect to backend for OAuth
  };

  return (
    <button onClick={handleLogin} className={styles.loginWithGoogleButton}>
      Login with Google
    </button>
  );
};

export default Login;
