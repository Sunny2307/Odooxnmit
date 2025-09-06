import { useState, useEffect } from 'react';
import { useApp } from '../../App';

const DiscussionThread = ({ projectId }) => {
  const { api, user } = useApp();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    loadMessages();
  }, [projectId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await api.discussions.getByProject(projectId);
      setMessages(response.messages);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        parentId: replyingTo || null
      };
      
      console.log('Sending message data:', messageData);
      console.log('Project ID:', projectId);
      
      const response = await api.discussions.create(projectId, messageData);
      
      if (replyingTo) {
        // Add reply to existing message
        setMessages(messages.map(msg => 
          msg.id === replyingTo 
            ? { ...msg, replies: [...msg.replies, response.message] }
            : msg
        ));
      } else {
        // Add new top-level message
        setMessages([response.message, ...messages]);
      }
      
      setNewMessage('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Discussion error:', err);
      console.error('Error details:', err.message);
      setError(err.message || 'Failed to send message');
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Discussion</h2>
          <p className="mt-1 text-gray-600">Team communication and collaboration</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* New Message Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                {replyingTo ? 'Reply to message' : 'Start a new discussion'}
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={replyingTo ? 'Write your reply...' : 'Share your thoughts with the team...'}
              />
            </div>
            
            <div className="flex items-center justify-between">
              {replyingTo && (
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel reply
                </button>
              )}
              
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {replyingTo ? 'Reply' : 'Post Message'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Messages List */}
      <div className="space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
            <p className="mt-1 text-sm text-gray-500">Start the conversation by posting a message.</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              user={user}
              onReply={(messageId) => setReplyingTo(messageId)}
              formatTimeAgo={formatTimeAgo}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Message Card Component
const MessageCard = ({ message, user, onReply, formatTimeAgo }) => {
  const [showReplies, setShowReplies] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      // Update message logic would go here
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    setLoading(true);
    try {
      // Delete message logic would go here
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user && user.id === message.user.id;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-primary-600">
            {message.user.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900">{message.user.name}</h4>
            <span className="text-xs text-gray-500">{formatTimeAgo(message.createdAt)}</span>
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  disabled={loading}
                  className="px-3 py-1 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }}
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.content}</p>
              
              {/* Message Actions */}
              <div className="mt-3 flex items-center space-x-4">
                <button
                  onClick={() => onReply(message.id)}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span>Reply</span>
                </button>
                
                {canEdit && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {message.replies && message.replies.length > 0 && (
        <div className="mt-4 ml-14">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 mb-3"
          >
            <svg className={`h-4 w-4 transform transition-transform ${showReplies ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>{message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}</span>
          </button>

          {showReplies && (
            <div className="space-y-4">
              {message.replies.map((reply) => (
                <div key={reply.id} className="flex items-start space-x-3 pl-4 border-l-2 border-gray-100">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-600">
                      {reply.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h5 className="text-xs font-medium text-gray-900">{reply.user.name}</h5>
                      <span className="text-xs text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-900 whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscussionThread;
