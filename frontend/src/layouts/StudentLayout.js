import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  Calendar,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  Rss,
  Search,
  Settings,
  User,
  Users,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

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

const getNotificationMeta = (type) => {
  switch (type) {
    case 'Event Update':
      return {
        icon: Calendar,
        className: 'bg-blue-100 text-blue-600'
      };
    case 'Reminder':
      return {
        icon: Bell,
        className: 'bg-emerald-100 text-emerald-600'
      };
    case 'Alert':
      return {
        icon: AlertCircle,
        className: 'bg-amber-100 text-amber-600'
      };
    default:
      return {
        icon: Info,
        className: 'bg-slate-100 text-slate-600'
      };
  }
};

export const StudentLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const {
    recentNotifications,
    unreadCount,
    isLoading: isLoadingNotifications
  } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const navLinks = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Communities',
      path: '/communities',
      icon: Users
    },
    {
      name: 'Events',
      path: '/events',
      icon: Calendar
    },
    {
      name: 'Feed',
      path: '/feed',
      icon: Rss
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login/student', { replace: true });
  };

  const handleToggleNotifications = () => {
    setIsNotificationsOpen((current) => !current);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                    <span className="text-xl font-bold text-white">U</span>
                  </div>
                  <span className="hidden text-xl font-bold text-slate-900 sm:block">
                    UniConnect
                  </span>
                </Link>
              </div>

              <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname.startsWith(link.path);

                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={cn(
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors',
                        isActive
                          ? 'border-primary-500 text-slate-900'
                          : 'border-transparent text-slate-500 hover:border-gray-300 hover:text-slate-700'
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm leading-5 placeholder-gray-500 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500"
                  placeholder="Search events..."
                />
              </div>

              <div className="relative">
                <button
                  onClick={handleToggleNotifications}
                  className="relative rounded-full p-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:text-gray-500"
                >
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 ? (
                    <span className="absolute right-1.5 top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  ) : null}
                </button>

                {isNotificationsOpen ? (
                  <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="flex items-center justify-between border-b border-gray-100 p-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Notifications
                        </h3>
                        <p className="text-xs text-slate-500">
                          {unreadCount} unread
                        </p>
                      </div>
                      <Link
                        to="/notifications"
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
                          No notifications yet.
                        </div>
                      ) : null}

                      {!isLoadingNotifications
                        ? recentNotifications.map((item) => {
                            const { notification } = item;
                            const { icon: Icon, className } =
                              getNotificationMeta(notification.type);
                            const linkTarget = notification.event?._id
                              ? `/events/${notification.event._id}`
                              : '/notifications';

                            return (
                              <Link
                                key={item._id}
                                to={linkTarget}
                                className="block border-b border-gray-50 p-4 last:border-0 hover:bg-gray-50"
                                onClick={() => setIsNotificationsOpen(false)}
                              >
                                <div className="flex gap-3">
                                  <div className="mt-1 flex-shrink-0">
                                    <div
                                      className={`flex h-8 w-8 items-center justify-center rounded-full ${className}`}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <p
                                        className={`line-clamp-1 text-sm ${
                                          item.isRead
                                            ? 'font-medium text-gray-800'
                                            : 'font-semibold text-slate-900'
                                        }`}
                                      >
                                        {notification.title}
                                      </p>
                                      {!item.isRead ? (
                                        <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                                      ) : null}
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                      {notification.message}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                      {formatRelativeTime(item.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            );
                          })
                        : null}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="relative ml-3">
                <div>
                  <button
                    onClick={() => setIsProfileOpen((current) => !current)}
                    className="flex rounded-full border-2 border-transparent text-sm transition focus:border-gray-300 focus:outline-none"
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src="https://i.pravatar.cc/150?u=student1"
                      alt="User avatar"
                    />
                  </button>
                </div>

                {isProfileOpen ? (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name || 'Student User'}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {user?.email || 'student@uniconnect.app'}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to="/preferences"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Preferences
                    </Link>
                    <div className="my-1 border-t border-gray-100"></div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-danger-600 hover:bg-gray-100"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center sm:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen((current) => !current)}
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 hover:bg-gray-100 hover:text-gray-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t border-gray-200 sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.path);

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center border-l-4 py-2 pl-3 pr-4 text-base font-medium',
                      isActive
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800'
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5 text-gray-400" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};
