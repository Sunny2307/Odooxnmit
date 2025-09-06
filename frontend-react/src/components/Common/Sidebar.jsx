import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../App';

const Sidebar = () => {
  const { user, api } = useApp();
  const location = useLocation();
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMyTasks();
  }, []);

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      const response = await api.tasks.getUserTasks();
      setMyTasks(response.tasks);
    } catch (err) {
      console.error('Failed to load user tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTaskCounts = () => {
    const counts = {
      total: myTasks.length,
      todo: myTasks.filter(task => task.status === 'To-Do').length,
      inProgress: myTasks.filter(task => task.status === 'In Progress').length,
      done: myTasks.filter(task => task.status === 'Done').length,
      overdue: myTasks.filter(task => {
        if (!task.dueDate || task.status === 'Done') return false;
        return new Date(task.dueDate) < new Date();
      }).length
    };
    return counts;
  };

  const taskCounts = getTaskCounts();

  const sidebarItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      href: '/projects',
      badge: null
    },
    {
      id: 'my-tasks',
      name: 'My Tasks',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      href: '/my-tasks',
      badge: taskCounts.total > 0 ? taskCounts.total : null
    },
    {
      id: 'todo-tasks',
      name: 'To-Do',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: '/tasks/todo',
      badge: taskCounts.todo > 0 ? taskCounts.todo : null
    },
    {
      id: 'in-progress-tasks',
      name: 'In Progress',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/tasks/in-progress',
      badge: taskCounts.inProgress > 0 ? taskCounts.inProgress : null
    },
    {
      id: 'completed-tasks',
      name: 'Completed',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/tasks/completed',
      badge: taskCounts.done > 0 ? taskCounts.done : null
    },
    {
      id: 'overdue-tasks',
      name: 'Overdue',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      href: '/tasks/overdue',
      badge: taskCounts.overdue > 0 ? taskCounts.overdue : null,
      badgeColor: 'bg-red-500'
    }
  ];

  const isActive = (href) => {
    if (href === '/projects') {
      return location.pathname === '/projects' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 h-full">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="px-3">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Navigation
          </h3>
        </div>
        
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`mr-3 ${isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.badgeColor || 'bg-blue-100 text-blue-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="mt-8 px-3">
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Stats
        </h3>
        
        <div className="space-y-3">
          <div className="px-3 py-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Tasks</span>
              <span className="text-sm font-semibold text-gray-900">{taskCounts.total}</span>
            </div>
          </div>
          
          <div className="px-3 py-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="text-sm font-semibold text-blue-600">{taskCounts.inProgress}</span>
            </div>
          </div>
          
          <div className="px-3 py-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-semibold text-green-600">{taskCounts.done}</span>
            </div>
          </div>
          
          {taskCounts.overdue > 0 && (
            <div className="px-3 py-2 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600">Overdue</span>
                <span className="text-sm font-semibold text-red-600">{taskCounts.overdue}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 px-3">
        <button
          onClick={loadMyTasks}
          disabled={loading}
          className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? (
            <div className="loading-spinner w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
          ) : (
            <>
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Tasks
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;