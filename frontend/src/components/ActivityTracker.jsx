import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ActivityTracker = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Generate or retrieve a persistent visitor ID for guests
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
        visitorId = `guest_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('visitorId', visitorId);
    }

    const sendHeartbeat = async () => {
      try {
        const identifier = user ? `user_${user._id}` : visitorId;
        await api.post('/auth/heartbeat', {
          identifier,
          isUser: !!user,
          role: user?.role || 'guest'
        });
      } catch (err) {
        // Silently fail, don't interrupt user experience
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval for regular heartbeats (every 60 seconds)
    // 60s is enough to stay "active" within the 3m window on the backend
    const interval = setInterval(sendHeartbeat, 60000);

    return () => clearInterval(interval);
  }, [user]);

  return null; // This component doesn't render anything
};

export default ActivityTracker;
