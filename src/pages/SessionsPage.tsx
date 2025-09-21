import React from 'react';
import { SessionManager } from '../components';

const SessionsPage: React.FC = () => {
  const handleSessionStart = (session: any) => {
    console.log('Session started:', session);
    // You could add notification, navigation, or other logic here
  };

  const handleSessionEnd = (sessionId: string) => {
    console.log('Session ended:', sessionId);
    // You could add notification, navigation, or other logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <SessionManager 
          onSessionStart={handleSessionStart}
          onSessionEnd={handleSessionEnd}
        />
      </div>
    </div>
  );
};

export default SessionsPage;