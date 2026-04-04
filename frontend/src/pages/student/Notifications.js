import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Bell,
  Calendar,
  Check,
  Info,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNotifications } from '../../contexts/NotificationContext';

const formatRelativeTime = (value) => {
  const date = new Date(value);
  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const intervals = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60]
  ];

  for (const [unit, seconds] of intervals) {
    const delta = Math.round(diffInSeconds / seconds);

    if (Math.abs(delta) >= 1) {
      return formatter.format(delta, unit);
    }
  }

  return 'just now';
};

const getNotificationStyles = (type) => {
  switch (type) {
    case 'Event Update':
      return {
        icon: Calendar,
        iconClassName: 'text-blue-600',
        iconBackgroundClassName: 'bg-blue-100'
      };
    case 'Reminder':
      return {
        icon: Bell,
        iconClassName: 'text-emerald-600',
        iconBackgroundClassName: 'bg-emerald-100'
      };
    case 'Alert':
      return {
        icon: AlertCircle,
        iconClassName: 'text-amber-600',
        iconBackgroundClassName: 'bg-amber-100'
      };
    default:
      return {
        icon: Info,
        iconClassName: 'text-slate-600',
        iconBackgroundClassName: 'bg-slate-100'
      };
  }
};

export const Notifications = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [busyNotificationId, setBusyNotificationId] = useState('');
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((item) =>
        activeTab === 'all' ? true : !item.isRead
      ),
    [activeTab, notifications]
  );

  const handleMarkAsRead = async (notificationId) => {
    setBusyNotificationId(notificationId);

    try {
      await markAsRead(notificationId);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyNotificationId('');
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsUpdatingAll(true);

    try {
      await markAllAsRead();
      toast.success('All notifications marked as read.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUpdatingAll(false);
    }
  };

  const handleDelete = async (notificationId) => {
    setBusyNotificationId(notificationId);

    try {
      await removeNotification(notificationId);
      toast.success('Notification removed.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyNotificationId('');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Bell className="h-6 w-6 text-slate-700" />
            Notifications
          </h1>
          <p className="mt-1 text-slate-500">
            Review announcements sent by admins and event organizers.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllAsRead}
          isLoading={isUpdatingAll}
          disabled={unreadCount === 0 || isLoading}
          leftIcon={<Check className="h-4 w-4" />}
        >
          Mark all as read
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('all')}
              className={`w-1/2 border-b-2 px-1 py-4 text-center text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:border-gray-300 hover:text-slate-700'
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex w-1/2 items-center justify-center gap-2 border-b-2 px-1 py-4 text-center text-sm font-medium transition-colors ${
                activeTab === 'unread'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:border-gray-300 hover:text-slate-700'
              }`}
            >
              Unread Only
              {unreadCount > 0 ? (
                <span className="rounded-full bg-danger-500 px-2 py-0.5 text-xs text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
          </nav>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading notifications...
          </div>
        ) : null}

        {!isLoading ? (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                  <Bell className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="mb-1 text-lg font-medium text-slate-900">
                  All caught up
                </h3>
                <p className="text-slate-500">
                  You do not have any
                  {activeTab === 'unread' ? ' unread' : ''} notifications right
                  now.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item, index) => {
                const { notification } = item;
                const {
                  icon: Icon,
                  iconClassName,
                  iconBackgroundClassName
                } = getNotificationStyles(notification.type);

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative p-4 transition-colors sm:p-6 ${
                      item.isRead ? 'bg-white' : 'bg-primary-50/50'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="mt-1 flex-shrink-0">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBackgroundClassName}`}
                        >
                          <Icon className={`h-5 w-5 ${iconClassName}`} />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm sm:text-base ${
                              item.isRead
                                ? 'font-medium text-slate-800'
                                : 'font-semibold text-slate-900'
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="whitespace-nowrap pt-1 text-xs text-slate-500">
                            {formatRelativeTime(item.createdAt)}
                          </p>
                        </div>

                        <p
                          className={`mt-1 text-sm ${
                            item.isRead ? 'text-slate-500' : 'text-slate-700'
                          }`}
                        >
                          {notification.message}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>{notification.type}</span>
                          <span>{notification.audienceLabel}</span>
                          {notification.community?.name ? (
                            <span>{notification.community.name}</span>
                          ) : null}
                        </div>

                        {notification.event?._id ? (
                          <Link
                            to={`/events/${notification.event._id}`}
                            className="mt-3 inline-flex text-sm font-medium text-primary-600 hover:text-primary-700"
                          >
                            View Event Details
                          </Link>
                        ) : null}
                      </div>
                    </div>

                    <div className="absolute right-4 top-4 flex gap-2 rounded-lg border border-gray-100 bg-white/90 p-1 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
                      {!item.isRead ? (
                        <button
                          onClick={() => handleMarkAsRead(item._id)}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                          title="Mark as read"
                          disabled={busyNotificationId === item._id}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
                        title="Delete"
                        disabled={busyNotificationId === item._id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        ) : null}
      </Card>
    </div>
  );
};
