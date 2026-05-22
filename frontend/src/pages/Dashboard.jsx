import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [showProjForm, setShowProjForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
  });

  const [activeTaskFormId, setActiveTaskFormId] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const taskRes = await axios.get(
          `${API_URL}/api/tasks/my-tasks`
        );

        setTasks(taskRes.data);

        if (user?.role === "Admin") {
          const projRes = await axios.get(
            `${API_URL}/api/projects`
          );

          setProjects(projRes.data);

          const userRes = await axios.get(
            `${API_URL}/api/auth/users`
          );

          setUsers(userRes.data);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    if (user) fetchData();

    const socket = io(API_URL);

    socket.on("taskAssigned", (incomingTask) => {
      if (
        user &&
        (incomingTask.assignedTo === user.id ||
          incomingTask.assignedTo === user._id)
      ) {
        setTasks((prevTasks) => [...prevTasks, incomingTask]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleCreateProject = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_URL}/api/projects`,
        newProject
      );

      setProjects([...projects, res.data]);

      setNewProject({
        title: "",
        description: "",
      });

      setShowProjForm(false);

    } catch (error) {
      alert(error.response?.data?.message ||
        "Failed to create project");
    }
  };

  const handleCreateTask = async (e, projectId) => {
    e.preventDefault();

    try {
      const taskData = {
        ...newTask,
        project: projectId
      };

      await axios.post(
        `${API_URL}/api/tasks`,
        taskData
      );

      alert("Task Assigned Successfully!");

      setNewTask({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: "",
      });

      setActiveTaskFormId(null);

    } catch (error) {
      alert(error.response?.data?.message ||
        "Failed to create task");
    }
  };

  // Keep your remaining JSX exactly same
};

export default Dashboard;
