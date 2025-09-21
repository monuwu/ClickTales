import React, { useState, useEffect } from 'react';

// Types
interface PhotoboothSession {
  id: string;
  sessionName: string;
  isActive: boolean;
  photosCount: number;
  createdAt: string;
  endedAt?: string;
  maxPhotos?: number;
}

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  totalPhotos: number;
  averagePhotosPerSession: number;
}

interface SessionManagerProps {
  onSessionStart?: (session: PhotoboothSession) => void;
  onSessionEnd?: (sessionId: string) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  onSessionStart,
  onSessionEnd
}) => {
  // State
  const [sessions, setSessions] = useState<PhotoboothSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [activeSession, setActiveSession] = useState<PhotoboothSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [maxPhotos, setMaxPhotos] = useState<number | undefined>(undefined);

  // Load sessions and stats on mount
  useEffect(() => {
    loadSessions();
    loadStats();
  }, []);

  // API Functions
  const loadSessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }

      const data = await response.json();
      setSessions(data.data.sessions || []);
      
      // Find active session
      const active = data.data.sessions?.find((s: PhotoboothSession) => s.isActive);
      setActiveSession(active || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sessions/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load stats');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const startSession = async () => {
    if (!newSessionName.trim()) {
      setError('Session name is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionName: newSessionName.trim(),
          maxPhotos: maxPhotos || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start session');
      }

      const data = await response.json();
      const newSession = data.data;
      
      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession);
      setShowCreateModal(false);
      setNewSessionName('');
      setMaxPhotos(undefined);
      setError(null);

      if (onSessionStart) {
        onSessionStart(newSession);
      }

      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to end session');
      }

      const data = await response.json();
      const updatedSession = data.data;

      setSessions(prev => prev.map(s => 
        s.id === sessionId ? updatedSession : s
      ));
      
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
      }

      if (onSessionEnd) {
        onSessionEnd(sessionId);
      }

      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end session');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📷 Photobooth Sessions
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your photobooth sessions and track photo collections
          </p>
        </div>
        
        {activeSession ? (
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm font-medium">
              🟢 Active Session
            </div>
            <button
              onClick={() => endSession(activeSession.id)}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <span className="text-white">⏹</span>
              End Session
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <span className="text-white">▶️</span>
            Start New Session
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSessions}</p>
              </div>
              <span className="text-2xl">📅</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeSessions}</p>
              </div>
              <span className="text-2xl">👥</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Photos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPhotos}</p>
              </div>
              <span className="text-2xl">🖼️</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Photos/Session</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averagePhotosPerSession.toFixed(1)}</p>
              </div>
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Session Info */}
      {activeSession && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-green-600 dark:text-green-400">📷</span>
            <h3 className="font-semibold text-green-800 dark:text-green-200">
              Active Session: {activeSession.sessionName}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-green-700 dark:text-green-300">
            <div className="flex items-center gap-2">
              <span>⏰</span>
              Duration: {formatDuration(activeSession.createdAt)}
            </div>
            <div className="flex items-center gap-2">
              <span>📸</span>
              Photos: {activeSession.photosCount}
              {activeSession.maxPhotos && ` / ${activeSession.maxPhotos}`}
            </div>
            <div className="flex items-center gap-2">
              <span>📅</span>
              Started: {formatDate(activeSession.createdAt)}
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📋 Recent Sessions</h3>
        
        {loading && sessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">📷</span>
            <p className="text-gray-500">No sessions found. Start your first photobooth session!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-lg border ${
                  session.isActive
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {session.sessionName}
                      </h4>
                      {session.isActive && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-medium rounded">
                          🟢 Active
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span>📸</span>
                        {session.photosCount} photos
                        {session.maxPhotos && ` / ${session.maxPhotos}`}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏰</span>
                        {session.isActive 
                          ? formatDuration(session.createdAt)
                          : formatDuration(session.createdAt, session.endedAt)
                        }
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        {formatDate(session.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  {session.isActive && (
                    <button
                      onClick={() => endSession(session.id)}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>⏹</span>
                      End
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ▶️ Start New Session
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Name *
                </label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Enter session name..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Photos (Optional)
                </label>
                <input
                  type="number"
                  value={maxPhotos || ''}
                  onChange={(e) => setMaxPhotos(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Unlimited"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewSessionName('');
                  setMaxPhotos(undefined);
                  setError(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startSession}
                disabled={loading || !newSessionName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>▶️</span>
                    Start Session
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;