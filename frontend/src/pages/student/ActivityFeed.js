import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Filter, Search, Ticket, Users } from 'lucide-react';
import { EventCard } from '../../components/EventCard';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentFeed } from '../../lib/feedApi';

const formatEventDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

const mapEventForCard = (event, isLive = false) => ({
  ...event,
  id: event._id,
  date: formatEventDate(event.eventDate),
  organizer: {
    name: event.community?.name || 'Campus Event',
    avatar:
      event.community?.imageUrl ||
      `https://picsum.photos/seed/${event.community?._id || event._id}/50/50`
  },
  image: event.imageUrl || `https://picsum.photos/seed/${event._id}/600/400`,
  isLive
});

export const ActivityFeed = () => {
  const { token } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedData, setFeedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getStudentFeed(token)
      .then((response) => {
        if (isMounted) {
          setFeedData(response);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFeedData(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const liveEvents = useMemo(
    () => (feedData?.sections.liveNow || []).map((event) => mapEventForCard(event, true)),
    [feedData]
  );
  const upcomingEvents = useMemo(
    () => (feedData?.sections.upcoming || []).map((event) => mapEventForCard(event)),
    [feedData]
  );
  const pastEvents = useMemo(
    () =>
      (feedData?.sections.recentlyCompleted || []).map((event) =>
        mapEventForCard(event)
      ),
    [feedData]
  );

  const allCategories = useMemo(
    () => [
      'All',
      ...new Set(
        [...liveEvents, ...upcomingEvents, ...pastEvents]
          .map((event) => event.category)
          .filter(Boolean)
      )
    ],
    [liveEvents, pastEvents, upcomingEvents]
  );

  const filterEvents = (events) =>
    events.filter((event) => {
      const matchesCategory =
        activeCategory === 'All' || event.category === activeCategory;
      const haystack = [
        event.title,
        event.description,
        event.organizer?.name,
        event.venue
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });

  const filteredLiveEvents = filterEvents(liveEvents);
  const filteredUpcomingEvents = filterEvents(upcomingEvents);
  const filteredPastEvents = filterEvents(pastEvents);
  const summary = feedData?.summary || {
    registeredEvents: 0,
    unreadNotifications: 0,
    activeCommunities: 0
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Student Feed</h1>
          <p className="mt-2 text-slate-500">
            Follow live campus activity, upcoming events, and recently completed sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Ticket className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  My Active Registrations
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {summary.registeredEvents}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Unread Notifications
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {summary.unreadNotifications}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Communities
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {summary.activeCommunities}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-slate-900 text-white'
                  : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button variant="outline" size="md" className="flex-shrink-0" disabled>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {filteredLiveEvents.length > 0 ? (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-danger-500 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-900">LIVE NOW</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLiveEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-slate-500" />
          <h2 className="text-xl font-bold text-slate-900">Upcoming Events</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-slate-500">
              Loading student feed...
            </div>
          ) : null}

          {filteredUpcomingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </div>

        {!isLoading && filteredUpcomingEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-100 bg-white py-12 text-center">
            <p className="text-slate-500">
              No upcoming events found for the selected category.
            </p>
          </div>
        ) : null}
      </section>

      <section className="opacity-75 transition-opacity hover:opacity-100">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Recently Completed
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPastEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </div>

        {!isLoading && filteredPastEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-100 bg-white py-12 text-center">
            <p className="text-slate-500">
              No completed events found for the selected category.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
};
