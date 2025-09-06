import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../App';
import Navbar from '../components/Common/Navbar';
import Sidebar from '../components/Common/Sidebar';
import TaskList from '../components/Task/TaskList';
import DiscussionThread from '../components/Discussion/DiscussionThread';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { api } = useApp();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState('');

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await api.projects.getById(id);
      setProject(response.project);
    } catch (err) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    setMemberLoading(true);
    setMemberError('');

    try {
      const response = await api.projects.addMember(id, memberEmail);
      // Reload project to get updated members
      await loadProject();
      setMemberEmail('');
      setShowMemberModal(false);
    } catch (err) {
      setMemberError(err.message || 'Failed to add member');
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      await api.projects.removeMember(id, memberId);
      // Reload project to get updated members
      await loadProject();
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            to="/projects"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <Link
            to="/projects"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Projects
          </Link>
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
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              to="/projects"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-2 text-lg text-gray-600 font-medium">{project.description}</p>
              )}
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-900">{project.tasks.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {project.tasks.filter(task => task.status === 'Done').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Messages</p>
                  <p className="text-3xl font-bold text-gray-900">{project.messages.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Team Members</p>
                  <p className="text-3xl font-bold text-gray-900">{project.members.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Project Details
                </h3>
                <dl className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created by</dt>
                      <dd className="text-lg font-semibold text-gray-900">{project.creator.name}</dd>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created on</dt>
                      <dd className="text-lg font-semibold text-gray-900">{formatDate(project.createdAt)}</dd>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last updated</dt>
                      <dd className="text-lg font-semibold text-gray-900">{formatDate(project.updatedAt)}</dd>
                    </div>
                  </div>
                </dl>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <svg className="h-6 w-6 text-orange-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Team Members
                  </h3>
                  <button
                    onClick={() => setShowMemberModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Member
                  </button>
                </div>
                <div className="space-y-3">
                  {project.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-sm font-bold text-white">
                            {member.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{member.user.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                        </div>
                      </div>
                      {member.role !== 'admin' && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove member"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'tasks'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Tasks</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('discussion')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'discussion'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Discussion</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="fade-in">
          {activeTab === 'tasks' && (
            <TaskList projectId={id} projectMembers={project.members} />
          )}
          {activeTab === 'discussion' && (
            <DiscussionThread projectId={id} />
          )}
        </div>

        {/* Add Member Modal */}
        {showMemberModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add Team Member</h3>
                  <button
                    onClick={() => {
                      setShowMemberModal(false);
                      setMemberEmail('');
                      setMemberError('');
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {memberError && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-800 font-medium">{memberError}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddMember}>
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter member's email address"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      The user must already have an account in the system.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMemberModal(false);
                        setMemberEmail('');
                        setMemberError('');
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={memberLoading}
                      className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {memberLoading ? (
                        <div className="flex items-center">
                          <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Adding...
                        </div>
                      ) : (
                        'Add Member'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;