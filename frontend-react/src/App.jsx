import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import components
import LoginPage from './components/Auth/Login';
import SignupPage from './components/Auth/Signup';
import ForgotPasswordPage from './components/Auth/ForgotPassword';
import ResetPasswordPage from './components/Auth/ResetPassword';
import VerifyEmailPage from './components/Auth/VerifyEmail';
import ProjectsPage from './components/Project/ProjectList';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProfilePage from './pages/ProfilePage';
import MyTasksPage from './pages/MyTasksPage';

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Context for global state
const AppContext = createContext();

// Custom hook to use app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// API utility functions
const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    sendOTP: (email) => api.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
    register: (userData) => api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    verifyEmail: (data) => api.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    login: (credentials) => api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    forgotPassword: (email) => api.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
    resetPassword: (data) => api.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getProfile: () => api.request('/auth/profile'),
  },

  // Project endpoints
  projects: {
    getAll: () => api.request('/projects'),
    getById: (id) => api.request(`/projects/${id}`),
    create: (data) => api.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => api.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => api.request(`/projects/${id}`, {
      method: 'DELETE',
    }),
    addMember: (id, email) => api.request(`/projects/${id}/members`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
    removeMember: (id, memberId) => api.request(`/projects/${id}/members/${memberId}`, {
      method: 'DELETE',
    }),
  },

  // Task endpoints
  tasks: {
    getByProject: (projectId) => api.request(`/tasks/projects/${projectId}`),
    getById: (id) => api.request(`/tasks/${id}`),
    create: (projectId, data) => api.request(`/tasks/projects/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => api.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    updateStatus: (id, status) => api.request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
    delete: (id) => api.request(`/tasks/${id}`, {
      method: 'DELETE',
    }),
    getUserTasks: () => api.request('/tasks/my-tasks'),
  },

  // Discussion endpoints
  discussions: {
    getByProject: (projectId) => api.request(`/discussions/projects/${projectId}`),
    create: (projectId, data) => api.request(`/discussions/projects/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => api.request(`/discussions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => api.request(`/discussions/${id}`, {
      method: 'DELETE',
    }),
  },

  // Notification endpoints
  notifications: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.request(`/notifications${queryString ? `?${queryString}` : ''}`);
    },
    markAsRead: (id) => api.request(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
    markAllAsRead: () => api.request('/notifications/mark-all-read', {
      method: 'PUT',
    }),
    delete: (id) => api.request(`/notifications/${id}`, {
      method: 'DELETE',
    }),
    clearAll: () => api.request('/notifications/clear-all', {
      method: 'DELETE',
    }),
  },
};

// App Provider Component
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.auth.getProfile();
          setUser(response.user);
          await loadNotifications();
        } catch (error) {
          localStorage.removeItem('token');
          console.error('Auth check failed:', error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Load notifications
  const loadNotifications = async () => {
    try {
      const response = await api.notifications.getAll({ limit: 10 });
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const response = await api.auth.login(credentials);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      await loadNotifications();
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  // Send OTP function
  const sendOTP = async (email) => {
    try {
      const response = await api.auth.sendOTP(email);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.auth.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Verify email function
  const verifyEmail = async (data) => {
    try {
      const response = await api.auth.verifyEmail(data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const response = await api.auth.forgotPassword(email);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (data) => {
    try {
      const response = await api.auth.resetPassword(data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    notifications,
    unreadCount,
    login,
    logout,
    sendOTP,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    loadNotifications,
    api,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useApp();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useApp();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/projects" replace /> : children;
};

// Main App Component
function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            } />
            <Route path="/verify-email" element={
              <PublicRoute>
                <VerifyEmailPage />
              </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/projects" element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            } />
            <Route path="/projects/:id" element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/my-tasks" element={
              <ProtectedRoute>
                <MyTasksPage />
              </ProtectedRoute>
            } />
            <Route path="/tasks/todo" element={
              <ProtectedRoute>
                <MyTasksPage />
              </ProtectedRoute>
            } />
            <Route path="/tasks/in-progress" element={
              <ProtectedRoute>
                <MyTasksPage />
              </ProtectedRoute>
            } />
            <Route path="/tasks/completed" element={
              <ProtectedRoute>
                <MyTasksPage />
              </ProtectedRoute>
            } />
            <Route path="/tasks/overdue" element={
              <ProtectedRoute>
                <MyTasksPage />
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/projects" replace />} />
            
            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Page not found</p>
                  <a href="/projects" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    Go to Projects
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;