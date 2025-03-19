import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";

const AddTaskModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    completed: false,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Retrieve token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated!");
        return;
      }

      // ✅ Decode token & extract userId safely
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken); // Debugging
      const userId = decodedToken?.user?.id;

      if (!userId) {
        alert("Invalid token structure. User ID not found.");
        return;
      }

      // ✅ Attach userId to task data
      const updatedFormData = { ...formData, userId };

      // ✅ Send request to backend
      const response = await fetch("https://srwr-backend.onrender.com/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const newTask = await response.json();

      // ✅ Ensure onSave is a function before calling it
      if (typeof onSave === "function") {
        onSave(newTask);
      }

      // ✅ Show success alert
      alert("Task added successfully!");

      // ✅ Reset form
      setFormData({
        taskName: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        completed: false,
      });

      // ✅ Close modal
      onClose();
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Error adding task! Please try again.");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Add Task</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label>Task Name:</label>
          <input type="text" name="taskName" value={formData.taskName} onChange={handleChange} required />

          <label>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required />

          <label>Due Date:</label>
          <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />

          <label>Priority:</label>
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <label>
            <input type="checkbox" name="completed" checked={formData.completed} onChange={handleChange} />
            Mark as Completed
          </label>

          <div style={styles.buttonContainer}>
            <button type="submit" style={styles.saveButton}>
              Save
            </button>
            <button type="button" style={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Styles
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex:"999"
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  saveButton: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px",
    border: "none",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: "10px",
    border: "none",
    cursor: "pointer",
  },
};

export default AddTaskModal;
