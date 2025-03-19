
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For redirection
// import LinkOrFileInput from "../LinkOrFileInput";
// import TableComponent from "./TableComponent";
import { jwtDecode } from "jwt-decode"; 

const AuthForm = () => {
  const [isActive, setIsActive] = useState(false);
const [signupData, setSignupData] = useState({
  username: "",
  email: "",
  password: "",
});

const [loginData, setLoginData] = useState({
  username: "",
  password: "",
});

  const navigate = useNavigate(); // Hook for navigation

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Signup API Call
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup Failed!");
      
        alert("Signup Successful!  Please login.");
        setIsActive(false); // Switch to login form
      
    } catch (error) {
      alert("Signup Error:User Already Exist " );
    }
  };

  // Login API Call
  const handleLogin = async (e) => {
    console.log(" function called")
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error( "Invalid Credentials");

      // Store token & user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(jwtDecode(data.token)));

      // alert("Login Successful!");
      navigate("/dashboard");

    } catch (error) {
      alert("Login Error:Wrong email or Password " );
    }
  };

  return (
    <div className={`container ${isActive ? "active" : ""}`}>
      {/* Login Form */}
      <div className="form-box login">
        <form onSubmit={handleLogin}>
          <h1>Login</h1>
          <div className="input-box">
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              value={loginData.username}
              onChange={handleLoginChange}
            />
          </div>
          <div className="input-box">
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={loginData.password}
              onChange={handleLoginChange}
            />
          </div>

          <button type="submit" className="btn">
            Login
          </button>
        </form>
      </div>

      {/* Registration Form */}
      <div className="form-box register">
        <form onSubmit={handleSignup}>
          <h1>Registration</h1>
          <div className="input-box">
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              value={signupData.username}
              onChange={handleSignupChange}
            />
          </div>
          <div className="input-box">
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={signupData.email}
              onChange={handleSignupChange}
            />
          </div>
          <div className="input-box">
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={signupData.password}
              onChange={handleSignupChange}
            />
          </div>
          <button type="submit" className="btn">
            Register
          </button>
        </form>
      </div>

      {/* Toggle Panel */}
      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Hello, Welcome!</h1>
          <p>Don't have an account?</p>
          <button className="btn" onClick={() => setIsActive(true)}>
            Register
          </button>
        </div>

        <div className="toggle-panel toggle-right">
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button className="btn" onClick={() => setIsActive(false)}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

