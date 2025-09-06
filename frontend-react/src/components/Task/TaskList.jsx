import { useState, useEffect } from 'react';
import { useApp } from '../../App';

const TaskList = ({ projectId, projectMembers }) => {
  const { api } = useApp();
  const [tasks, setTasks] = useState([]);
  const [tasksByStatus, setTasksByStatus] = useState({
    'To-Do': [],
    'In Progress': [],
    'Done': []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await api.tasks.getByProject(projectId);
      setTasks(response.tasks);
      setTasksByStatus(response.tasksByStatus);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks]);
    setTasksByStatus(prev => ({
      ...prev,
      [newTask.status]: [newTask, ...prev[newTask.status]]
    }));
    setShowCreateModal(false);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    setTasksByStatus(prev => {
      const newStatus = updatedTask.status;
      const oldStatus = tasks.find(t => t.id === updatedTask.id)?.status;
      
      if (oldStatus === newStatus) {
        return {
          ...prev,
          [newStatus]: prev[newStatus].map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        };
      } else {
        return {
          ...prev,
          [oldStatus]: prev[oldStatus].filter(task => task.id !== updatedTask.id),
          [newStatus]: [updatedTask, ...prev[newStatus]]
        };
      }
    });
  };

  const handleTaskDeleted = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
    setTasksByStatus(prev => ({
      ...prev,
      [task.status]: prev[task.status].filter(t => t.id !== taskId)
    }));
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Add visual feedback to the dragged element
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    // Reset visual feedback
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Add visual feedback to drop zone
    e.currentTarget.classList.add('bg-blue-50', 'border-blue-400');
  };

  const handleDragLeave = (e) => {
    // Remove visual feedback from drop zone
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
        handleTaskUpdated(updatedTask.task);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="mt-1 text-gray-600">Manage and track project tasks</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Task
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div
            key={status}
            className={`rounded-lg border-2 border-dashed ${getStatusColor(status)} p-4 min-h-96 transition-all duration-200`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${getStatusTextColor(status)}`}>
                {status}
              </h3>
              <span className={`text-sm ${getStatusTextColor(status)} bg-white px-2 py-1 rounded-full`}>
                {statusTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {statusTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projectMembers={projectMembers}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          projectId={projectId}
          projectMembers={projectMembers}
          onClose={() => setShowCreateModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, projectMembers, onTaskUpdated, onTaskDeleted, onDragStart, onDragEnd }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && task.status !== 'Done';
  };

  return (
    <>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
        onDragEnd={onDragEnd}
        onClick={() => setShowDetailModal(true)}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1"
      >
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
          
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between">
            {task.assignee && (
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-600">
                    {task.assignee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-600">{task.assignee.name}</span>
              </div>
            )}
            
            {task.dueDate && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                isOverdue(task.dueDate) 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {showDetailModal && (
        <TaskDetailModal
          task={task}
          projectMembers={projectMembers}
          onClose={() => setShowDetailModal(false)}
          onTaskUpdated={onTaskUpdated}
          onTaskDeleted={onTaskDeleted}
        />
      )}
    </>
  );
};

// Create Task Modal Component
const CreateTaskModal = ({ projectId, projectMembers, onClose, onTaskCreated }) => {
  const { api } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.tasks.create(projectId, formData);
      onTaskCreated(response.task);
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Create New Task</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Task Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter task description"
                />
              </div>

              <div>
                <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700">
                  Assignee (Optional)
                </label>
                <select
                  id="assigneeId"
                  name="assigneeId"
                  value={formData.assigneeId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select assignee</option>
                  {projectMembers.map((member) => (
                    <option key={member.id} value={member.user.id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                  Due Date (Optional)
                </label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  'Create Task'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Task Detail Modal Component
const TaskDetailModal = ({ task, projectMembers, onClose, onTaskUpdated, onTaskDeleted }) => {
  const { api } = useApp();
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    assigneeId: task.assigneeId || '',
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    status: task.status
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.tasks.update(task.id, formData);
      onTaskUpdated(response.task);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.tasks.delete(task.id);
      onTaskDeleted(task.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Task Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Task Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700">
                    Assignee
                  </label>
                  <select
                    id="assigneeId"
                    name="assigneeId"
                    value={formData.assigneeId}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Unassigned</option>
                    {projectMembers.map((member) => (
                      <option key={member.id} value={member.user.id}>
                        {member.user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="To-Do">To-Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Task
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    'Update Task'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60">
              <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Task</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Are you sure you want to delete this task? This action cannot be undone.
                  </p>
                  <div className="mt-6 flex justify-center space-x-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
