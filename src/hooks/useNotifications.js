import { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

export const useNotifications = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const connect = useCallback(() => {
    const eventSource = new EventSource(`${BASE_URL}/notifications`, {
      withCredentials: true
    });

    eventSource.onopen = () => {
      console.log('Connected to notification stream');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        console.log('Received notification:', notification);

        // Add to notifications list
        setNotifications(prev => [notification, ...prev.slice(0, 9)]);

        // Show snackbar for important notifications
        if (notification.type === 'new_order') {
          enqueueSnackbar(notification.message, {
            variant: 'info',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
            action: (
              <button onClick={() => window.location.reload()}>
                Refresh
              </button>
            )
          });
        } else if (notification.type === 'order_status_update') {
          enqueueSnackbar(notification.message, {
            variant: 'success',
            anchorOrigin: { vertical: 'top', horizontal: 'right' }
          });
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      setIsConnected(false);
      eventSource.close();
    };

    return eventSource;
  }, [enqueueSnackbar]);

  useEffect(() => {
    const eventSource = connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [connect]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    isConnected,
    notifications,
    clearNotifications,
    notificationCount: notifications.length
  };
};
