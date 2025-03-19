import React, { useState, useEffect } from "react";

const EditTaskModal = ({ isOpen, task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    completed: false,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        taskName: task.taskName || "",
        description: task.description || "",
        dueDate: task.dueDate || "",
        priority: task.priority || "Medium",
        completed: task.completed || false,
      });
    }
  }, [task]);

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
      const response = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      
      const updatedTask = await response.json();
      onSave(updatedTask); // Pass the updated task to the parent component
      setFormData({ taskName: "", description: "", dueDate: "", priority: "Medium", completed: false });
      onClose();
    
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Edit Task</h2>
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
            <button type="submit" style={styles.saveButton}>Save</button>
            <button type="button" style={styles.cancelButton} onClick={onClose}>Cancel</button>
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

export default EditTaskModal;
