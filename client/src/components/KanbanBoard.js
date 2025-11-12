import React, { useState, useEffect } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/kanban";

const KanbanBoard = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "backlog",
    priority: "medium",
    startDate: "",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const getTasksByStatus = (status) => {
    let filteredTasks = tasks.filter((task) => task.status === status);

    // Filter by priority if priority filter is set
    if (priorityFilter !== "all") {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === priorityFilter
      );
    }

    // Filter by search keyword if search is active
    if (isSearchActive && searchKeyword.trim() !== "") {
      const keyword = searchKeyword.toLowerCase();
      filteredTasks = filteredTasks.filter((task) => {
        const titleMatch = task.title?.toLowerCase().includes(keyword);
        const descriptionMatch = task.description
          ?.toLowerCase()
          .includes(keyword);
        return titleMatch || descriptionMatch;
      });
    }

    return filteredTasks;
  };

  const handleSearch = () => {
    if (searchKeyword.trim() !== "") {
      setIsSearchActive(true);
    } else {
      setIsSearchActive(false);
    }
  };

  const handleClearSearch = () => {
    setSearchKeyword("");
    setIsSearchActive(false);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Helper function to format date to YYYY-MM-DD for input
  const formatDateForInput = (date) => {
    if (!date) return "";
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to format date for display
  const formatDateForDisplay = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isOwnTask = (task) => {
    return task.user?._id === user.id || task.user === user.id;
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskForm({
      title: "",
      description: "",
      status: "backlog",
      priority: "medium",
      startDate: "",
      deadline: "",
    });
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      startDate: formatDateForInput(task.startDate),
      deadline: formatDateForInput(task.deadline),
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!taskForm.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    // Check if trying to edit someone else's task
    if (editingTask && !isOwnTask(editingTask)) {
      alert("You can only edit your own tasks");
      return;
    }

    setLoading(true);
    try {
      if (editingTask && isOwnTask(editingTask)) {
        await updateTask(editingTask._id, taskForm);
      } else {
        await createTask(taskForm);
      }
      setIsModalOpen(false);
      loadTasks();
      setEditingTask(null);
      setTaskForm({
        title: "",
        description: "",
        status: "backlog",
        priority: "medium",
        startDate: "",
        deadline: "",
      });
    } catch (error) {
      console.error("Error saving task:", error);
      alert(error.response?.data?.message || "Error saving task");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const task = tasks.find((t) => t._id === taskId);
    if (task && !isOwnTask(task)) {
      alert("You can only delete your own tasks");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(taskId);
      loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert(error.response?.data?.message || "Error deleting task");
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    if (!isOwnTask(task)) {
      alert("You can only move your own tasks");
      return;
    }

    try {
      await updateTask(task._id, { ...task, status: newStatus });
      loadTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
      alert(error.response?.data?.message || "Error updating task status");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    { id: "backlog", title: "Backlog", color: "bg-gray-100" },
    { id: "todo", title: "Todo", color: "bg-blue-100" },
    { id: "in-progress", title: "In Progress", color: "bg-yellow-100" },
    { id: "done", title: "Done", color: "bg-green-100" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
        <button
          onClick={handleAddTask}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>

      {/* Search Bar and Filters */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 relative min-w-[200px]">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Cari task berdasarkan keyword..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex gap-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
              {isSearchActive && (
                <button
                  onClick={handleClearSearch}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          {(isSearchActive || priorityFilter !== "all") && (
            <div className="mt-2 text-sm text-gray-600">
              {isSearchActive && (
                <span>
                  Menampilkan task yang mengandung:{" "}
                  <span className="font-semibold">"{searchKeyword}"</span>
                </span>
              )}
              {isSearchActive && priorityFilter !== "all" && (
                <span className="mx-2">•</span>
              )}
              {priorityFilter !== "all" && (
                <span>
                  Priority:{" "}
                  <span className="font-semibold capitalize">
                    {priorityFilter}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.id} className={`${column.color} rounded-lg p-4`}>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              {column.title} ({getTasksByStatus(column.id).length})
            </h2>
            <div className="space-y-3">
              {getTasksByStatus(column.id).map((task) => (
                <div
                  key={task._id}
                  className="bg-white rounded-lg shadow p-4 cursor-move"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {task.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        By: {task.user?.username || "Unknown"}
                        {isOwnTask(task) && (
                          <span className="ml-1 text-blue-600">(Yours)</span>
                        )}
                      </p>
                    </div>
                    {isOwnTask(task) && (
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        X
                      </button>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {task.description}
                    </p>
                  )}
                  {(task.startDate || task.deadline) && (
                    <div className="mb-2 space-y-1">
                      {task.startDate && (
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Mulai:</span>{" "}
                          {formatDateForDisplay(task.startDate)}
                        </p>
                      )}
                      {task.deadline && (
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Deadline:</span>{" "}
                          {formatDateForDisplay(task.deadline)}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    {isOwnTask(task) && (
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {isOwnTask(task) && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {columns
                        .filter((col) => col.id !== task.status)
                        .map((col) => (
                          <button
                            key={col.id}
                            onClick={() => handleStatusChange(task, col.id)}
                            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                          >
                            Move to {col.title}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ))}
              {getTasksByStatus(column.id).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No tasks
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingTask && isOwnTask(editingTask)
                ? "Edit Task"
                : editingTask
                ? "View Task"
                : "Add Task"}
            </h2>
            {editingTask && !isOwnTask(editingTask) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  This task belongs to{" "}
                  {editingTask.user?.username || "another user"}. You can only
                  edit or delete your own tasks.
                </p>
              </div>
            )}
            {(editingTask && isOwnTask(editingTask)) || !editingTask ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="Enter task description"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Mulai (Opsional)
                  </label>
                  <input
                    type="date"
                    value={taskForm.startDate}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline (Opsional)
                  </label>
                  <input
                    type="date"
                    value={taskForm.deadline}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, deadline: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingTask(null);
                      setTaskForm({
                        title: "",
                        description: "",
                        status: "backlog",
                        priority: "medium",
                        startDate: "",
                        deadline: "",
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTask}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Title:</p>
                  <p className="font-medium">{editingTask.title}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Description:</p>
                  <p className="text-gray-800">
                    {editingTask.description || "No description"}
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Status:</p>
                  <p className="font-medium capitalize">
                    {editingTask.status.replace("-", " ")}
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Priority:</p>
                  <p className="font-medium capitalize">
                    {editingTask.priority}
                  </p>
                </div>
                {editingTask.startDate && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Tanggal Mulai:</p>
                    <p className="font-medium">
                      {formatDateForDisplay(editingTask.startDate)}
                    </p>
                  </div>
                )}
                {editingTask.deadline && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Deadline:</p>
                    <p className="font-medium">
                      {formatDateForDisplay(editingTask.deadline)}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
