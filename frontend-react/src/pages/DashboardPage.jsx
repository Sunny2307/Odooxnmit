import { useState, useEffect } from 'react';
import { useApp } from '../App';
import Navbar from '../components/Common/Navbar';
import Sidebar from '../components/Common/Sidebar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const DashboardPage = () => {
  const { api, user } = useApp();
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    tasks: [],
    personalTodos: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use the dashboard API endpoint to get aggregated data
      const dashboardResponse = await api.dashboard.getStats();
      
      if (dashboardResponse.success) {
        setDashboardData({
          projects: dashboardResponse.data.projects || [],
          tasks: dashboardResponse.data.tasks || [],
          personalTodos: dashboardResponse.data.personalTodos || [],
          notifications: dashboardResponse.data.notifications || []
        });
      } else {
        throw new Error(dashboardResponse.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
      
      // Fallback to individual API calls if dashboard API fails
      try {
        const [projectsResponse, tasksResponse, todosResponse, notificationsResponse] = await Promise.all([
          api.projects.getAll(),
          api.tasks.getUserTasks(),
          api.personalTodos.getAll(),
          api.notifications.getAll({ limit: 20 })
        ]);

        setDashboardData({
          projects: projectsResponse.projects || [],
          tasks: tasksResponse.tasks || [],
          personalTodos: todosResponse.personalTodos || [],
          notifications: notificationsResponse.notifications || []
        });
        setError(''); // Clear error if fallback succeeds
      } catch (fallbackErr) {
        console.error('Fallback data loading error:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const getStats = () => {
    const { projects, tasks, personalTodos } = dashboardData;
    
    // Task statistics
    const taskStats = {
      total: tasks.length,
      todo: tasks.filter(task => task.status === 'To-Do').length,
      inProgress: tasks.filter(task => task.status === 'In Progress').length,
      completed: tasks.filter(task => task.status === 'Done').length,
      overdue: tasks.filter(task => {
        if (!task.dueDate || task.status === 'Done') return false;
        return new Date(task.dueDate) < new Date();
      }).length
    };

    // Personal todo statistics
    const todoStats = {
      total: personalTodos.length,
      pending: personalTodos.filter(todo => !todo.completed).length,
      completed: personalTodos.filter(todo => todo.completed).length,
      overdue: personalTodos.filter(todo => {
        if (!todo.dueDate || todo.completed) return false;
        return new Date(todo.dueDate) < new Date();
      }).length
    };

    // Project statistics
    const projectStats = {
      total: projects.length,
      active: projects.length, // All projects are considered active in this simple model
    };

    return { taskStats, todoStats, projectStats };
  };

  const { taskStats, todoStats, projectStats } = getStats();

  // Prepare chart data
  const getTaskStatusData = () => [
    { name: 'To-Do', value: taskStats.todo, color: '#6B7280' },
    { name: 'In Progress', value: taskStats.inProgress, color: '#3B82F6' },
    { name: 'Completed', value: taskStats.completed, color: '#10B981' },
    { name: 'Overdue', value: taskStats.overdue, color: '#EF4444' }
  ];

  const getWeeklyProgressData = () => {
    // Calculate real weekly progress from actual task data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Start from Monday
    
    return days.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);
      
      // Count tasks completed on this day
      const completedOnDay = dashboardData.tasks.filter(task => {
        if (task.status !== 'Done' || !task.updatedAt) return false;
        const taskDate = new Date(task.updatedAt);
        return taskDate.toDateString() === dayDate.toDateString();
      }).length;
      
      // Count tasks created on this day
      const createdOnDay = dashboardData.tasks.filter(task => {
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === dayDate.toDateString();
      }).length;
      
      return {
        day,
        completed: completedOnDay,
        created: createdOnDay
      };
    });
  };

  const getProjectTaskDistribution = () => {
    const projectTaskCounts = {};
    dashboardData.tasks.forEach(task => {
      const projectName = task.project?.name || 'Unknown Project';
      projectTaskCounts[projectName] = (projectTaskCounts[projectName] || 0) + 1;
    });
    
    return Object.entries(projectTaskCounts).map(([project, count]) => ({
      project,
      tasks: count
    }));
  };

  const getRecentActivity = () => {
    const activities = [];
    
    // Add recent tasks (sorted by creation date)
    const recentTasks = [...dashboardData.tasks]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    recentTasks.forEach(task => {
      activities.push({
        type: 'task',
        title: task.title,
        project: task.project?.name,
        status: task.status,
        date: new Date(task.createdAt),
        icon: '📋'
      });
    });

    // Add recent personal todos (sorted by creation date)
    const recentTodos = [...dashboardData.personalTodos]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    
    recentTodos.forEach(todo => {
      activities.push({
        type: 'todo',
        title: todo.title,
        status: todo.completed ? 'completed' : 'pending',
        date: new Date(todo.createdAt),
        icon: '✅'
      });
    });

    // Sort by date and return recent 8
    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="mt-2 text-lg text-gray-600 font-medium">
                  Welcome back, {user?.name}! Here's your productivity overview.
                </p>
              </div>
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                ) : (
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                Refresh Data
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Projects */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-purple-600">{projectStats.total}</p>
                  </div>
                </div>
              </div>

              {/* Total Tasks */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Project Tasks</p>
                    <p className="text-2xl font-bold text-blue-600">{taskStats.total}</p>
                  </div>
                </div>
              </div>

              {/* Personal Todos */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Personal To-Dos</p>
                    <p className="text-2xl font-bold text-green-600">{todoStats.total}</p>
                  </div>
                </div>
              </div>

              {/* Overdue Items */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue Items</p>
                    <p className="text-2xl font-bold text-red-600">{taskStats.overdue + todoStats.overdue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Task Status Distribution */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getTaskStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getTaskStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly Progress */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getWeeklyProgressData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="completed" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="created" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project Task Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Project</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getProjectTaskDistribution()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="project" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {getRecentActivity().map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 text-lg">{activity.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {activity.project && `${activity.project} • `}
                            {activity.status}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(activity.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                  <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-blue-600 font-medium">Create Project</span>
                </button>
                
                <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
                  <svg className="h-6 w-6 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-green-600 font-medium">Add To-Do</span>
                </button>
                
                <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
                  <svg className="h-6 w-6 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-purple-600 font-medium">View All Tasks</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
