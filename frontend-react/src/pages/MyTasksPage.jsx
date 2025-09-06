import { useState, useEffect } from 'react';
import { useApp } from '../App';
import Navbar from '../components/Common/Navbar';
import Sidebar from '../components/Common/Sidebar';

const MyTasksPage = () => {
  const { api } = useApp();
  const [tasks, setTasks] = useState([]);
  const [tasksByStatus, setTasksByStatus] = useState({
    'To-Do': [],
    'In Progress': [],
    'Done': []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyTasks();
  }, []);

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      const response = await api.tasks.getUserTasks();
      setTasks(response.tasks);
      
      // Group tasks by status
      const groupedTasks = {
        'To-Do': response.tasks.filter(task => task.status === 'To-Do'),
        'In Progress': response.tasks.filter(task => task.status === 'In Progress'),
        'Done': response.tasks.filter(task => task.status === 'Done')
      };
      setTasksByStatus(groupedTasks);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('bg-blue-50', 'border-blue-400');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
    
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.status !== newStatus) {
      try {
        const updatedTask = await api.tasks.updateStatus(taskId, newStatus);
        
        // Update local state
        setTasks(tasks.map(t => t.id === taskId ? updatedTask.task : t));
        
        // Update grouped tasks
        const oldStatus = task.status;
        setTasksByStatus(prev => ({
          ...prev,
          [oldStatus]: prev[oldStatus].filter(t => t.id !== taskId),
          [newStatus]: [updatedTask.task, ...prev[newStatus]]
        }));
      } catch (err) {
        console.error('Failed to update task status:', err);
        setError('Failed to update task status');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'To-Do': return 'bg-gray-100 border-gray-300';
      case 'In Progress': return 'bg-blue-100 border-blue-300';
      case 'Done': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'To-Do': return 'text-gray-700';
      case 'In Progress': return 'text-blue-700';
      case 'Done': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Done') return false;
    return new Date(dueDate) < new Date();
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
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                My Tasks
              </h1>
              <p className="mt-2 text-lg text-gray-600 font-medium">
                Manage and track your assigned tasks across all projects
              </p>
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

            {/* Task Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{tasksByStatus['In Progress'].length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{tasksByStatus['Done'].length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">
                      {tasks.filter(task => isOverdue(task.dueDate, task.status)).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                <div
                  key={status}
                  className={`rounded-xl border-2 border-dashed ${getStatusColor(status)} p-6 min-h-96 transition-all duration-200`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-lg font-bold ${getStatusTextColor(status)}`}>
                      {status}
                    </h3>
                    <span className={`text-sm ${getStatusTextColor(status)} bg-white px-3 py-1 rounded-full font-semibold`}>
                      {statusTasks.length}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {statusTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className="bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                              {task.title}
                            </h4>
                            {isOverdue(task.dueDate, task.status) && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Overdue
                              </span>
                            )}
                          </div>
                          
                          {task.description && (
                            <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                          )}

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <div className="h-6 w-6 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                  {task.project.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-gray-600 font-medium">{task.project.name}</span>
                            </div>
                            
                            {task.dueDate && (
                              <span className={`text-xs font-medium ${
                                isOverdue(task.dueDate, task.status) ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {statusTasks.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">
                          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500">No tasks in this status</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasksPage;