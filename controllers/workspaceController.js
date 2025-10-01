
import React, { useContext, useEffect, useState } from "react";
import { WorkspaceContext } from "../context/WorkspaceContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";


class TasksErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Error in Tasks component:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <p className="p-4 text-red-600">Something went wrong while loading tasks.</p>;
    }
    return this.props.children;
  }
}

export default function Tasks() {
  const {
    currentWorkspace,
    tasks = [],
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useContext(WorkspaceContext);

  const { socket } = useSocket();
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    if (currentWorkspace) fetchTasks(currentWorkspace.id);
  }, [currentWorkspace]);

  if (!currentWorkspace) {
    return <p className="p-4 text-gray-600">Select a workspace to see tasks.</p>;
  }

  const user = JSON.parse(localStorage.getItem("user"));

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    setLoading(true);

    try {
      const createdTask = await createTask(newTask.title, newTask.description);

      if (socket && user) {
        socket.emit("sendNotification", {
          workspaceId: currentWorkspace.id,
          userId: user.id,
          type: "task",
          message: `${user.name || "A user"} created a new task "${newTask.title}"`,
          link: `/workspace/${currentWorkspace.id}/tasks`,
          timestamp: Date.now(),
        });
      }

      setNewTask({ title: "", description: "" });
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId, taskTitle) => {
    try {
      await updateTask(taskId, { status: "completed" });

      if (socket && user) {
        socket.emit("sendNotification", {
          workspaceId: currentWorkspace.id,
          userId: user.id,
          type: "task",
          message: `${user.name || "A user"} completed the task "${taskTitle}"`,
          link: `/workspace/${currentWorkspace.id}/tasks`,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  const handleDeleteTaskClick = async (taskId, taskTitle) => {
    try {
      await deleteTask(taskId);

      if (socket && user) {
        socket.emit("sendNotification", {
          workspaceId: currentWorkspace.id,
          userId: user.id,
          type: "task",
          message: `${user.name || "A user"} deleted the task "${taskTitle}"`,
          link: `/workspace/${currentWorkspace.id}/tasks`,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  return (
    <TasksErrorBoundary>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Tasks in "{currentWorkspace.name}"</h2>

        
        <div className="mb-6 bg-gray-50 p-4 rounded shadow">
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring"
          />
          <textarea
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring"
          />
          <button
            onClick={handleCreateTask}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Adding..." : "Add Task"}
          </button>
        </div>

       
        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks yet.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="p-3 bg-white shadow rounded flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  {task.description && <p className="text-gray-500 text-sm">{task.description}</p>}
                  <p className="text-gray-400 text-xs mt-1">
                    Created: {new Date(task.created_at).toLocaleString()}
                    {task.completed_at && (
                      <> | Completed: {new Date(task.completed_at).toLocaleString()}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${
                      task.status === "completed" ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  >
                    {task.status}
                  </span>
                  {task.status !== "completed" && (
                    <button
                      onClick={() => handleCompleteTask(task.id, task.title)}
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTaskClick(task.id, task.title)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </TasksErrorBoundary>
  );
}
