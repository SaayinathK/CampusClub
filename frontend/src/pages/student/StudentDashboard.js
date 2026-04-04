import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Users
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { getCommunities } from '../../lib/communityApi';
import { getEvents } from '../../lib/eventApi';

const formatDashboardDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

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

export const StudentDashboard = () => {
  const { token, user } = useAuth();
  const {
    recentNotifications: notifications,
    isLoading: isLoadingNotifications
  } = useNotifications();
  const [communities, setCommunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    let isMounted = true;

    getCommunities(token)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setCommunities(
          response.communities.filter((community) => community.status === 'Active')
        );
      })
      .catch(() => {
        if (isMounted) {
          setCommunities([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingCommunities(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    getEvents(token, { status: 'Published' })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setEvents(response.events);
      })
      .catch(() => {
        if (isMounted) {
          setEvents([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingEvents(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const featuredCommunities = communities.slice(0, 3);
  const upcomingEvents = events
    .filter((event) => new Date(event.eventDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .slice(0, 2);

  const stats = [
    {
      label: 'Registered Events',
      value: '4',
      icon: Ticket,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      label: 'Upcoming Events',
      value: String(upcomingEvents.length),
      icon: Calendar,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100'
    },
    {
      label: 'Active Communities',
      value: String(communities.length),
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="mt-1 text-slate-500">{currentDate}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" asChild>
            <Link to="/registrations">My Registrations</Link>
          </Button>
          <Button asChild>
            <Link to="/events">Browse Events</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
                >
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Featured Communities
            </h2>
            <Link
              to="/communities"
              className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Explore all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredCommunities.map((community) => (
              <Card key={community._id} hoverable className="flex flex-col">
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={
                      community.imageUrl ||
                      `https://picsum.photos/seed/${community._id}/500/300`
                    }
                    alt={community.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-3 top-3">
                    <Badge variant="primary">{community.category}</Badge>
                  </div>
                </div>
                <CardContent className="flex flex-1 flex-col p-4">
                  <h3 className="mb-2 line-clamp-1 font-semibold text-slate-900">
                    {community.name}
                  </h3>
                  <p className="line-clamp-3 text-sm text-slate-500">
                    {community.description}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-slate-500">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-slate-400" />
                      {community.memberCount} members
                    </div>
                    <div className="flex items-center">
                      <ArrowRight className="mr-2 h-4 w-4 text-slate-400" />
                      President: {community.president}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isLoadingCommunities && featuredCommunities.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-semibold text-slate-900">
                  No active communities yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Communities added by admins will appear here automatically.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {isLoadingCommunities ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-slate-500">
                Loading communities...
              </CardContent>
            </Card>
          ) : null}

          <div className="flex items-center justify-between pt-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Upcoming Events
            </h2>
            <Link
              to="/events"
              className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {upcomingEvents.map((event) => (
              <Card key={event._id} hoverable className="flex flex-col">
                <div className="relative h-32 w-full overflow-hidden">
                  <img
                    src={
                      event.imageUrl ||
                      `https://picsum.photos/seed/${event._id}/400/200`
                    }
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-2 top-2">
                    <Badge variant="success">{event.status}</Badge>
                  </div>
                </div>
                <CardContent className="flex flex-1 flex-col p-4">
                  <h3 className="mb-2 line-clamp-1 font-semibold text-slate-900">
                    {event.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-slate-500">
                    {event.description}
                  </p>
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock className="mr-2 h-4 w-4 text-slate-400" />
                      {formatDashboardDate(event.eventDate)} at {event.time}
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                      {event.venue}
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <Users className="mr-2 h-4 w-4 text-slate-400" />
                      {event.community?.name || 'Campus Event'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isLoadingEvents && upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-semibold text-slate-900">
                  No published upcoming events
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Events created by admins will appear here automatically.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {isLoadingEvents ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-slate-500">
                Loading events...
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="flex items-center text-base">
                <Bell className="mr-2 h-4 w-4 text-slate-500" />
                Recent Notifications
              </CardTitle>
              <Link
                to="/notifications"
                className="text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                See all
              </Link>
            </CardHeader>
            <div className="divide-y divide-gray-100">
              {notifications.map((item) => (
                <div
                  key={item._id}
                  className={`p-4 transition-colors hover:bg-gray-50 ${
                    item.isRead ? '' : 'bg-primary-50/50'
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                        item.isRead ? 'bg-transparent' : 'bg-primary-500'
                      }`}
                    />
                    <div>
                      <p
                        className={`text-sm ${
                          item.isRead
                            ? 'font-medium text-slate-700'
                            : 'font-semibold text-slate-900'
                        }`}
                      >
                        {item.notification.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                        {item.notification.message}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isLoadingNotifications ? (
                <div className="p-4 text-sm text-slate-500">
                  Loading notifications...
                </div>
              ) : null}

              {!isLoadingNotifications && notifications.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">
                  Admin notifications will appear here.
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
