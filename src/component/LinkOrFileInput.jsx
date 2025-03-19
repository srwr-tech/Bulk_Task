import React, { useState, useEffect } from "react";
import "./style.css";
import AddTaskModal from './AddTaskModal';
import { useNavigate } from "react-router-dom"; // For redirection
import { jwtDecode } from "jwt-decode";

const LinkOrFileInput = () => {
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const navigate = useNavigate(); // Hook for navigation
  
  // Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("https://srwr-backend.onrender.com/api/tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);
 
  const handleLinkChange = (e) => {
    setLink(e.target.value);
    if (e.target.value) setFile(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "text/csv") {
        alert("Only CSV files are allowed.");
        return;
      }
      setFile(selectedFile);
      setLink("");
    }
  };

  const importTasks = async () => {
    if (link) {
      if (!link.includes("docs.google.com/spreadsheets")) {
        alert("Please enter a valid Google Sheets public link.");
        return;
      }
      try {
        const sheetId = link.split("/d/")[1]?.split("/")[0];
        const response = await fetch(
          `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`
        );
        const data = await response.text();
        processCSVData(data);
      } catch (error) {
        console.error("Error fetching Google Sheets data:", error);
        alert("Failed to fetch tasks from Google Sheets.");
      }
    } else if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        processCSVData(event.target.result);
      };
      reader.readAsText(file);
    } else {
      alert("Please provide a link or upload a file.");
    }
  };

  const processCSVData = (csvData) => {
    const rows = csvData.split("\n").map(row => row.split(","));
    const formattedTasks = rows.slice(1).map(row => ({
      taskName: row[0] || "N/A",
      description: row[1] || "N/A",
      dueDate: row[2] || "N/A",
      priority: row[3] || "N/A"
    }));
    setTasks(formattedTasks);
    sendDataToBackend(formattedTasks);
  };

  // ✅ Helper function to get userId safely
const getUserId = () => {
  const userData = localStorage.getItem("user");
  if (!userData) return null;

  try {
      const parsedUser = JSON.parse(userData);
      return parsedUser?.user?.id || null;
  } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
  }
};

const sendDataToBackend = async (tasks) => {
  try {
      const userId = getUserId(); // ✅ Get userId using helper function
      if (!userId) {
          alert("User not authenticated!");
          return;
      }

      // ✅ Format tasks according to your schema
      const formattedTasks = tasks.map(task => ({
          userId,  // ✅ Ensure userId is included
          taskName: task.taskName || "N/A",
          description: task.description || "N/A",
          dueDate: task.dueDate || "N/A",
          priority: task.priority || "Low",  // Default to "Low"
          completed: "false"  // Default to "false"
      }));

      const response = await fetch("https://srwr-backend.onrender.com/api/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks: formattedTasks }) // ✅ Send correctly formatted data
      });

      if (!response.ok) throw new Error("Failed to save tasks");

      alert("Tasks successfully saved!");
      
      // ✅ Clear link & file input after successful save
      setLink("");
      setFile(null);
      
  } catch (error) {
      console.error("Error saving tasks:", error);
      alert("Error saving tasks to backend.");
  }
};


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert("Logged out successfully!");
    navigate("/"); // Redirect to login page
};


  return (
    <>
    <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}  onSave={(newTask) => setTasks([...tasks, newTask])}  />
  <div className="container">
    <div className="box">
    <div>
    <button className="btn btn-primary btn-lg shadow-lg" onClick={() => setIsModalOpen(true)}>Create new tasks manually</button>
    <br />
    <button className="btn btn-danger" onClick={handleLogout}>LogOut</button>
        </div>
      <h2>Upload File or Paste Google Sheets Link</h2>
      {!file && (
        <input
          type="text"
          placeholder="Paste your Google Sheets public link here"
          value={link}
          onChange={handleLinkChange}
          className="input-field"
        />
      )}
      {!link && (
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="file-input"
        />
      )}
      <button onClick={importTasks} className="import-button">Import Tasks</button>
      {link && <p className="message success">✔ Link added</p>}
      {file && <p className="message info">✔ File selected: {file.name}</p>}
      
    </div>
   
  </div>
    </>
  );
};

export default LinkOrFileInput;
