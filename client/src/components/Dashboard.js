import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTasks } from '../services/kanban';

const Dashboard = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter overdue tasks (tasks with deadline that has passed and status is not 'done')
  const getOverdueTasks = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to midnight for accurate date comparison
    
    return tasks.filter((task) => {
      if (!task.deadline || task.status === 'done') {
        return false;
      }
      
      const deadline = new Date(task.deadline);
      deadline.setHours(0, 0, 0, 0);
      
      return deadline < now;
    });
  };

  // Format date for display
  const formatDateForDisplay = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status display
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'backlog':
        return 'Backlog';
      case 'todo':
        return 'Todo';
      case 'in-progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  const overdueTasks = getOverdueTasks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {user.username}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/reports"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Daily Reports</h3>
              <p className="text-sm text-gray-500">View and manage your daily reports</p>
            </div>
          </div>
        </Link>

        <Link
          to="/kanban"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Kanban Board</h3>
              <p className="text-sm text-gray-500">Organize your tasks and projects</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Overdue Tasks Section */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Overdue Tasks</h2>
            {overdueTasks.length > 0 && (
              <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                {overdueTasks.length} {overdueTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            )}
          </div>

          {loading ? (
            <p className="text-gray-500 text-center py-4">Loading tasks...</p>
          ) : overdueTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Tidak ada task yang overdue. Semua task sudah selesai tepat waktu! 🎉
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overdueTasks.map((task) => (
                <div
                  key={task._id}
                  className="border-2 border-red-300 bg-red-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                      <p className="text-xs text-gray-600 mb-1">
                        By: {task.user?.username || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Status:</span>
                      <span className="text-xs font-medium text-gray-800">
                        {getStatusDisplay(task.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Priority:</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Deadline:</span>
                      <span className="text-xs font-semibold text-red-600">
                        {formatDateForDisplay(task.deadline)}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/kanban"
                    className="block w-full text-center text-sm bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    View in Kanban
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

