import React, { useMemo, useState, useEffect } from "react";
import { useTable, usePagination, useSortBy } from "react-table";
import { FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";
import EditTaskModal from "../EditTaskModal";


  const TableComponent = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch data from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userData = localStorage.getItem("user");

        if (!userData) {
            console.log("No user data found in localStorage");
            return;
        }

        const parsedUser = JSON.parse(userData); 
        const userId = parsedUser.user.id; // Extract the ID

        console.log("User ID:", userId); // Debugging

        // ✅ Ensure userId is correctly passed in the URL
        const response = await fetch(`https://srwr-backend.onrender.com/api/taskers/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const jsonData = await response.json();
        console.log("Fetched tasks:", jsonData);
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
}, []);

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);
  
  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "_id" },
      { Header: "Task Name", accessor: "taskName" },
      { Header: "Description", accessor: "description" },
      { Header: "Due Date", accessor: "dueDate" },
      { Header: "Priority", accessor: "priority" },
      {
        Header: "Task Status",
        accessor: "completed",
        Cell: ({ value }) => (
          <span style={value ? styles.completedStatus : styles.pendingStatus}>
            {value ? "✅ Completed" : "⏳ Pending"}
          </span>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div style={styles.actionButtons}>
            <button style={styles.editButton} onClick={() => handleEdit(row.original)}>
              <FaEdit />
            </button>
            <button style={styles.deleteButton} onClick={() => handleDelete(row.original._id)}>
              <FaTrash />
            </button>
            <button
              style={row.original.completed ? styles.completedButtonDisabled : styles.completedButton}
              onClick={() => handleComplete(row.original._id)}
              disabled={row.original.completed}
            >
              <FaCheckCircle />
            </button>
          </div>
        ),
      },
    ],
    [data]
  );



  const handleSave = async (updatedTask) => {
    try {
      await fetch(`https://srwr-backend.onrender.com/api/tasks/${updatedTask._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });

      setData((prevData) =>
        prevData.map((item) => (item._id === updatedTask._id ? updatedTask : item))
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await fetch(`https://srwr-backend.onrender.com/api/tasks/${id}`, { method: "DELETE" });
        setData((prevData) => prevData.filter((item) => item._id !== id));
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const handleComplete = async (id) => {
    console.log(" sarwar")
    try {
      const response = await fetch(`https://srwr-backend.onrender.com/api/taskss/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      console.log(response)
      if (!response.ok) {
        throw new Error("Failed to update task status");
      }
  
      setData((prevData) =>
        prevData.map((item) => (item._id === id ? { ...item, completed: true } : item))
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };
  

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state: { pageIndex },
  } = useTable(
    { columns, data: filteredData, initialState: { pageIndex: 0, pageSize: 5 } },
    useSortBy,
    usePagination
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Task Management Table</h2>

      {/* Search Box */}
      <input
        type="text"
        style={styles.searchBox}
        placeholder="🔍 Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Table */}
      <table {...getTableProps()} style={styles.table}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  key={column.id}
                  style={styles.headerCell}
                >
                  {column.render("Header")}
                  <span
                    style={{
                      ...styles.sortIcon,
                      opacity: column.isSorted || column.isSortedDesc ? 1 : 0,
                    }}
                    className="sort-icon"
                  >
                    {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : " ⬍"}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.length > 0 ? (
            page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={row.id} style={styles.row}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} key={cell.id} style={styles.bodyCell}>
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length} style={styles.noData}>
                No matching records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <EditTaskModal isOpen={isModalOpen} task={selectedTask} onClose={() => setIsModalOpen(false)} onSave={handleSave} />

      {/* Pagination Controls */}
      <div style={styles.paginationContainer}>
        <button style={styles.button} onClick={previousPage} disabled={!canPreviousPage}>
          ◀ Prev
        </button>
        <span style={styles.pageInfo}>
          Page {pageIndex + 1} of {pageOptions.length}
        </span>
        <button style={styles.button} onClick={nextPage} disabled={!canNextPage}>
          Next ▶
        </button>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    width: "90%",
    margin: "auto",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    padding: "5px 20px",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  },
  heading: { fontSize: "26px", fontWeight: "bold", color: "#333" },
  searchBox: {
    padding: "10px",
    width: "100%",
    maxWidth: "350px",
    marginBottom: "15px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    outline: "none",
  },
  table: { width: "100%", borderCollapse: "collapse",  border: "1px solid black", },
  headerCell: {
    padding: "12px",
    borderBottom: "2px solid #007bff",
    backgroundColor: "#007bff",
    border: "1px solid black",
    color: "white",
    fontWeight: "bold",
    position: "relative",
    transition: "background 0.2s ease-in-out",
  },
  td: {
    border: "1px solid black",
  },
  sortIcon: {
    marginLeft: "5px",
    transition: "opacity 0.3s ease-in-out",
  },
  bodyCell: { padding: "12px", borderBottom: "1px solid #ddd", textAlign: "center" },
  completedStatus: { color: "green", fontWeight: "bold" },
  pendingStatus: { color: "red", fontWeight: "bold" },
  actionButtons: { display: "flex", gap: "8px", justifyContent: "center" },
  paginationContainer: { marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" },
  button: { padding: "8px 14px", border: "none", backgroundColor: "#007bff", color: "white" },
};

export default TableComponent;
