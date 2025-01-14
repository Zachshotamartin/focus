import React from "react";
import { useNavigate } from "react-router-dom";

const Logout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("access_token");
      navigate("/");
    }
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

// Add some basic styling for the button
// const styles = {
//   button: {
//     padding: "10px 20px",
//     backgroundColor: "#d9534f",
//     color: "white",
//     border: "none",
//     borderRadius: "5px",
//     cursor: "pointer",
//     fontSize: "16px",
//   },
// };

export default Logout;
