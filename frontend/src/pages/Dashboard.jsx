import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  // Display States
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  // Form States
  const [showProjForm, setShowProjForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [activeTaskFormId, setActiveTaskFormId] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
  });

  // Initial Fetch & WebSocket Connection
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Everyone fetches their own tasks
        const taskRes = await axios.get(
          "http://localhost:5000/api/tasks/my-tasks",
        );
        setTasks(taskRes.data);

        // Only Admins need to fetch the full project and user lists
        if (user?.role === "Admin") {
          const projRes = await axios.get("http://localhost:5000/api/projects");
          setProjects(projRes.data);

          const userRes = await axios.get(
            "http://localhost:5000/api/auth/users",
          );
          setUsers(userRes.data);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    if (user) fetchData();

    // Setup WebSockets for Real-Time Updates
    const socket = io("http://localhost:5000");

    socket.on("taskAssigned", (incomingTask) => {
      // If the incoming task is assigned to the currently logged-in user, add it to their screen
      if (
        user &&
        (incomingTask.assignedTo === user.id ||
          incomingTask.assignedTo === user._id)
      ) {
        setTasks((prevTasks) => [...prevTasks, incomingTask]);
      }
    });

    return () => {
      socket.disconnect(); // Cleanup connection on unmount
    };
  }, [user]);

  // Submit new Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/projects",
        newProject,
      );
      setProjects([...projects, res.data]);
      setNewProject({ title: "", description: "" });
      setShowProjForm(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create project");
    }
  };

  // Submit new Task
  const handleCreateTask = async (e, projectId) => {
    e.preventDefault();
    try {
      const taskData = { ...newTask, project: projectId };
      await axios.post("http://localhost:5000/api/tasks", taskData);

      alert("Task Assigned Successfully!");
      setNewTask({ title: "", description: "", assignedTo: "", dueDate: "" });
      setActiveTaskFormId(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create task");
    }
  };

  const isOverdue = (date, status) =>
    new Date(date) < new Date() && status !== "Done";

  return (
    <div className="container">
      {/* ========================================== */}
      {/* HEADER                                     */}
      {/* ========================================== */}
      <header className="app-header">
        <div className="user-info">
          <h1>Dashboard</h1>
          <span className="role-badge">{user?.role}</span>
        </div>
        <button onClick={logout} className="btn btn-danger">
          Logout
        </button>
      </header>

      {/* ========================================== */}
      {/* ADMIN ONLY UI SECTION                      */}
      {/* ========================================== */}
      {user?.role === "Admin" && (
        <>
          {/* Create Project Section */}
          <div style={{ marginBottom: "30px" }}>
            {!showProjForm ? (
              <button
                onClick={() => setShowProjForm(true)}
                className="btn btn-success"
              >
                + Create New Project
              </button>
            ) : (
              <div className="form-container">
                <h3 style={{ marginBottom: "15px" }}>Create a New Project</h3>
                <form onSubmit={handleCreateProject}>
                  <input
                    type="text"
                    placeholder="Project Title"
                    required
                    value={newProject.title}
                    onChange={(e) =>
                      setNewProject({ ...newProject, title: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Project Description"
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    style={{ minHeight: "80px" }}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit" className="btn btn-primary">
                      Save Project
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProjForm(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Projects Grid */}
          <section style={{ marginBottom: "50px" }}>
            <h2 style={{ marginBottom: "20px" }}>Your Projects</h2>
            {projects.length === 0 ? (
              <p className="text-muted">No projects yet.</p>
            ) : (
              <div className="projects-grid">
                {projects.map((proj) => (
                  <div key={proj._id} className="card">
                    <h3>{proj.title}</h3>
                    <p>{proj.description}</p>

                    {/* Assign Task Form Inside Project Card */}
                    <div
                      style={{
                        marginTop: "20px",
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: "20px",
                      }}
                    >
                      {activeTaskFormId !== proj._id ? (
                        <button
                          onClick={() => setActiveTaskFormId(proj._id)}
                          className="btn btn-primary"
                          style={{ width: "100%" }}
                        >
                          + Assign Task
                        </button>
                      ) : (
                        <form onSubmit={(e) => handleCreateTask(e, proj._id)}>
                          <h4
                            style={{ marginBottom: "10px", fontSize: "0.9rem" }}
                          >
                            New Task
                          </h4>
                          <input
                            type="text"
                            placeholder="Task Title"
                            required
                            value={newTask.title}
                            onChange={(e) =>
                              setNewTask({ ...newTask, title: e.target.value })
                            }
                          />
                          <input
                            type="text"
                            placeholder="Short Description (Optional)"
                            value={newTask.description}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                description: e.target.value,
                              })
                            }
                          />
                          <select
                            required
                            value={newTask.assignedTo}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                assignedTo: e.target.value,
                              })
                            }
                          >
                            <option value="" disabled>
                              Select Member
                            </option>
                            {users.map((u) => (
                              <option key={u._id} value={u._id}>
                                {u.name} ({u.role})
                              </option>
                            ))}
                          </select>
                          <input
                            type="date"
                            required
                            value={newTask.dueDate}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                dueDate: e.target.value,
                              })
                            }
                          />
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              marginTop: "5px",
                            }}
                          >
                            <button
                              type="submit"
                              className="btn btn-success"
                              style={{ flex: 1 }}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTaskFormId(null)}
                              className="btn btn-secondary"
                              style={{ flex: 1 }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* ========================================== */}
      {/* UNIVERSAL UI SECTION (Visible to everyone) */}
      {/* ========================================== */}
      <section>
        <h2 style={{ marginBottom: "20px" }}>Your Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-muted">You have no assigned tasks.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task._id} className="task-item">
                <span className="task-title">{task.title}</span>
                {task.description && (
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-muted)",
                      marginBottom: "8px",
                    }}
                  >
                    {task.description}
                  </span>
                )}
                <div
                  className="task-meta"
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span className="status-badge">{task.status}</span>
                  <span>
                    • Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  {isOverdue(task.dueDate, task.status) && (
                    <span className="overdue">⚠️ OVERDUE</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
