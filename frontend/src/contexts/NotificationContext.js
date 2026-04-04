import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  deleteNotification,
  getAdminNotifications,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '../lib/notificationApi';

const NotificationContext = createContext(undefined);
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function sortByCreatedAt(items) {
  return [...items].sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt)
  );
}

function upsertById(items, nextItem) {
  const remainingItems = items.filter((item) => item._id !== nextItem._id);
  return sortByCreatedAt([nextItem, ...remainingItems]);
}

export function NotificationProvider({ children }) {
  const { role, token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!token || !role || !user) {
      setNotifications([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);

    const loader =
      role === 'admin' ? getAdminNotifications(token) : getMyNotifications(token);

    loader
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setNotifications(
          role === 'admin' ? response.notifications : response.notifications
        );
      })
      .catch(() => {
        if (isMounted) {
          setNotifications([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const eventSource = new EventSource(
      `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`
    );

    const handleNotificationEvent = (event) => {
      const payload = JSON.parse(event.data);

      setNotifications((current) => {
        if (role === 'student') {
          if (payload.type === 'created' && payload.notification) {
            return upsertById(current, payload.notification);
          }

          if (payload.type === 'updated' && payload.notification) {
            return upsertById(current, payload.notification);
          }

          if (payload.type === 'bulk_read') {
            const readIds = new Set(payload.ids || []);

            return current.map((item) =>
              readIds.has(item._id)
                ? {
                    ...item,
                    isRead: true,
                    readAt: payload.readAt
                  }
                : item
            );
          }

          if (payload.type === 'deleted') {
            return current.filter((item) => item._id !== payload.id);
          }

          return current;
        }

        if (role === 'admin') {
          if (payload.type === 'created' && payload.notification) {
            return upsertById(current, payload.notification);
          }

          return current;
        }

        return current;
      });
    };

    eventSource.addEventListener('notification', handleNotificationEvent);

    return () => {
      isMounted = false;
      eventSource.close();
    };
  }, [role, token, user]);

  const value = useMemo(() => {
    const unreadCount =
      role === 'student'
        ? notifications.filter((notification) => !notification.isRead).length
        : 0;
    const recentNotifications = notifications.slice(0, 3);
    const adminBadgeCount =
      role === 'admin'
        ? notifications.filter((notification) => {
            const createdAt = new Date(notification.createdAt);
            return Date.now() - createdAt.getTime() <= 24 * 60 * 60 * 1000;
          }).length
        : 0;

    return {
      notifications,
      recentNotifications,
      unreadCount,
      adminBadgeCount,
      isLoading,
      upsertNotification(notification) {
        setNotifications((current) => upsertById(current, notification));
      },
      async markAsRead(notificationId) {
        const response = await markNotificationAsRead(notificationId, token);

        setNotifications((current) =>
          current.map((item) =>
            item._id === notificationId ? response.notification : item
          )
        );

        return response;
      },
      async markAllAsRead() {
        await markAllNotificationsAsRead(token);

        setNotifications((current) =>
          current.map((item) => ({
            ...item,
            isRead: true,
            readAt: item.readAt || new Date().toISOString()
          }))
        );
      },
      async removeNotification(notificationId) {
        await deleteNotification(notificationId, token);

        setNotifications((current) =>
          current.filter((item) => item._id !== notificationId)
        );
      }
    };
  }, [isLoading, notifications, role, token]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
}
