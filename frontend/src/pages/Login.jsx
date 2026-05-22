import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  // State to toggle between Login and Signup modes
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member", // Default role for signups
  });
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      // Determine which API endpoint to hit based on mode
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const res = await axios.post(
        `http://localhost:5000${endpoint}`,
        formData,
      );

      // Pass the user data and token to our Context Provider
      login(res.data.user, res.data.token);

      // Redirect to the Dashboard
      navigate("/");
    } catch (err) {
      // Capture and display errors from the backend (e.g., "User already exists")
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div
      className="login-container"
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2>{isLogin ? "Sign In to Your Dashboard" : "Create an Account"}</h2>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        {/* Only show Name and Role fields if signing up */}
        {!isLogin && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
              style={{ padding: "10px" }}
            />
            <select
              name="role"
              onChange={handleChange}
              style={{ padding: "10px" }}
            >
              <option value="Member">Team Member</option>
              <option value="Admin">Admin</option>
            </select>
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
          required
          style={{ padding: "10px" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          style={{ padding: "10px" }}
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#0056b3",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      <button
        onClick={() => setIsLogin(!isLogin)}
        style={{
          marginTop: "15px",
          background: "none",
          border: "none",
          color: "#0056b3",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        {isLogin
          ? "Don't have an account? Sign up here."
          : "Already have an account? Log in."}
      </button>
    </div>
  );
};

export default Login;
