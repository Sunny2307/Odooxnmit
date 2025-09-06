import { useState, useEffect } from 'react';
import { useApp } from '../App';
import Navbar from '../components/Common/Navbar';
import Sidebar from '../components/Common/Sidebar';
import { generateDataExportPDF, generateReportPDF, generateActivityLogPDF, downloadPDF } from '../utils/pdfGenerator';

const ProfilePage = () => {
  const { user, logout, api } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    logout();
  };

  // Export data functionality
  const handleExportData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.profile.exportData();
      
      if (response.success) {
        // Generate PDF with charts
        const pdf = await generateDataExportPDF(response.data, user);
        const filename = `teamnest-data-export-${new Date().toISOString().split('T')[0]}.pdf`;
        downloadPDF(pdf, filename);
        
        setSuccess('Data exported as PDF successfully!');
      } else {
        setError(response.message || 'Failed to export data');
      }
    } catch (err) {
      setError(err.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  // Download reports functionality
  const handleDownloadReport = async (reportType = 'monthly') => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.profile.generateReport({ reportType });
      
      if (response.success) {
        // Generate PDF report with charts
        const pdf = await generateReportPDF(response.data, reportType);
        const filename = `teamnest-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
        downloadPDF(pdf, filename);
        
        setSuccess(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded as PDF successfully!`);
      } else {
        setError(response.message || 'Failed to generate report');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // View activity log functionality
  const handleViewActivityLog = async () => {
    try {
      setActivityLoading(true);
      setError('');
      
      const response = await api.profile.getActivityLog({ limit: 50 });
      
      if (response.success) {
        setActivityLog(response.data.activities);
        setShowActivityLog(true);
      } else {
        setError(response.message || 'Failed to load activity log');
      }
    } catch (err) {
      setError(err.message || 'Failed to load activity log');
    } finally {
      setActivityLoading(false);
    }
  };

  const formatActivityDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Download activity log as PDF
  const handleDownloadActivityLogPDF = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.profile.getActivityLog({ limit: 100 });
      
      if (response.success) {
        // Generate PDF activity log
        const pdf = await generateActivityLogPDF(response.data.activities, user);
        const filename = `teamnest-activity-log-${new Date().toISOString().split('T')[0]}.pdf`;
        downloadPDF(pdf, filename);
        
        setSuccess('Activity log downloaded as PDF successfully!');
      } else {
        setError(response.message || 'Failed to generate activity log PDF');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate activity log PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
          <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Account Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-medium text-primary-600">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
                    <p className="text-gray-600">@{user?.username}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      disabled
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={user?.username || ''}
                      disabled
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <input
                      type="text"
                      value={user?.createdAt ? formatDate(user.createdAt) : ''}
                      disabled
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Status
                    </label>
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-900">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Security</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button 
                  onClick={handleExportData}
                  disabled={loading}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 disabled:opacity-50"
                >
                  <span>Export Data</span>
                  {loading && (
                    <div className="loading-spinner w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  )}
                </button>
                
                <div className="space-y-2">
                  <button 
                    onClick={() => handleDownloadReport('weekly')}
                    disabled={loading}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 disabled:opacity-50"
                  >
                    <span>Weekly Report</span>
                    {loading && (
                      <div className="loading-spinner w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => handleDownloadReport('monthly')}
                    disabled={loading}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 disabled:opacity-50"
                  >
                    <span>Monthly Report</span>
                    {loading && (
                      <div className="loading-spinner w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                    )}
                  </button>
                </div>
                
                <button 
                  onClick={handleViewActivityLog}
                  disabled={activityLoading}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 disabled:opacity-50"
                >
                  <span>View Activity Log</span>
                  {activityLoading && (
                    <div className="loading-spinner w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  )}
                </button>
                
                <button 
                  onClick={handleDownloadActivityLogPDF}
                  disabled={loading}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 disabled:opacity-50"
                >
                  <span>Download Activity Log PDF</span>
                  {loading && (
                    <div className="loading-spinner w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
              <h2 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h2>
              
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md">
                  Deactivate Account
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* App Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">About TeamNest</h2>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>Version 1.0.0</p>
                <p>Team Collaboration Platform</p>
                <p>Built with React & Node.js</p>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
      
      {/* Activity Log Modal */}
      {showActivityLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
              <button
                onClick={() => setShowActivityLog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activityLog.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No activity found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLog.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 text-lg">{activity.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action === 'completed' ? 'Completed' :
                             activity.action === 'started' ? 'Started' :
                             activity.action === 'created' ? 'Created' :
                             activity.action === 'received' ? 'Received' : activity.action} {activity.title}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatActivityDate(activity.timestamp)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-2">
                          {activity.project && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {activity.project}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                            activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            activity.status === 'unread' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowActivityLog(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;