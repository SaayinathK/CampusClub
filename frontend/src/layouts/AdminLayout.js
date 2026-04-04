import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Users,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Badge } from '../components/ui/Badge';

const formatRelativeTime = (value) => {
  const date = new Date(value);
  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const intervals = [
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

const getStatusBadge = (notification) => {
  if (notification.status === 'Failed') {
    return <Badge variant="danger">Failed</Badge>;
  }

  if (notification.emailStatus === 'Skipped') {
    return <Badge variant="warning">In-App Only</Badge>;
  }

  return <Badge variant="success">Sent</Badge>;
};

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const {
    recentNotifications,
    adminBadgeCount,
    isLoading: isLoadingNotifications
  } = useNotifications();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const sidebarLinks = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Communities',
      path: '/admin/communities',
      icon: Users
    },
    {
      name: 'Events',
      path: '/admin/events',
      icon: Calendar
    },
    {
      name: 'Registrations',
      path: '/admin/registrations',
      icon: ClipboardList
    },
    {
      name: 'Payments',
      path: '/admin/payments',
      icon: CreditCard
    },
    {
      name: 'Notifications',
      path: '/admin/notifications',
      icon: Bell
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: BarChart3
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: FileText
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login/admin', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between bg-slate-950 px-6">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <span className="text-xl font-bold text-white">U</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Admin Portal</span>
          </Link>
          <button
            className="text-gray-400 hover:text-white lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="scrollbar-hide h-[calc(100vh-4rem)] space-y-1 overflow-y-auto px-4 py-6">
          <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Management
          </div>
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              location.pathname.startsWith(link.path) ||
              (link.path === '/admin/dashboard' && location.pathname === '/admin');

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 group-hover:text-white'
                  )}
                />
                {link.name}
              </Link>
            );
          })}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mr-4 rounded-md p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="relative hidden w-64 sm:block lg:w-96">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm leading-5 placeholder-gray-500 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Search admin..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen((current) => !current)}
                className="relative rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
              >
                <Bell className="h-5 w-5" />
                {adminBadgeCount > 0 ? (
                  <span className="absolute right-1 top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                    {adminBadgeCount > 9 ? '9+' : adminBadgeCount}
                  </span>
                ) : null}
              </button>

              {isNotificationsOpen ? (
                <div className="absolute right-0 mt-2 w-96 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="flex items-center justify-between border-b border-gray-100 p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Notification Activity
                      </h3>
                      <p className="text-xs text-slate-500">
                        Live updates from the notification center
                      </p>
                    </div>
                    <Link
                      to="/admin/notifications"
                      className="text-xs font-medium text-primary-600 hover:text-primary-700"
                      onClick={() => setIsNotificationsOpen(false)}
                    >
                      View all
                    </Link>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="p-4 text-sm text-slate-500">
                        Loading notifications...
                      </div>
                    ) : null}

                    {!isLoadingNotifications && recentNotifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">
                        No notifications have been sent yet.
                      </div>
                    ) : null}

                    {!isLoadingNotifications
                      ? recentNotifications.map((notification) => (
                          <Link
                            key={notification._id}
                            to="/admin/notifications"
                            className="block border-b border-gray-50 p-4 last:border-0 hover:bg-gray-50"
                            onClick={() => setIsNotificationsOpen(false)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                                  {notification.title}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                  {notification.message}
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                  <span>{notification.audienceLabel}</span>
                                  <span>{formatRelativeTime(notification.createdAt)}</span>
                                </div>
                              </div>
                              <div>{getStatusBadge(notification)}</div>
                            </div>
                          </Link>
                        ))
                      : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mx-2 h-8 w-px bg-gray-200"></div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || 'admin@uniconnect.app'}
                </p>
              </div>
              <img
                className="h-9 w-9 rounded-full border-2 border-gray-200 object-cover"
                src="https://i.pravatar.cc/150?u=admin1"
                alt="Admin avatar"
              />

              <button
                onClick={handleLogout}
                className="ml-2 inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-100"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
