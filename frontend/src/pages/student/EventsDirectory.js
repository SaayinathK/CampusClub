import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { EventCard } from '../../components/EventCard';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { getEvents } from '../../lib/eventApi';

const formatEventDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

export const EventsDirectory = () => {
  const { token } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getEvents(token, { status: 'Published' })
      .then((response) => {
        if (isMounted) {
          setEvents(response.events);
        }
      })
      .catch(() => {
        if (isMounted) {
          setEvents([]);
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

  const categories = [
    'All',
    ...new Set(events.map((event) => event.category).filter(Boolean))
  ];

  const mappedEvents = events.map((event) => ({
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
    isLive: false
  }));

  const filteredEvents = mappedEvents.filter((event) => {
    const matchesCategory =
      activeCategory === 'All' || event.category === activeCategory;
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Events Directory</h1>
        <p className="mt-2 text-slate-500">
          Discover and register for upcoming events across campus.
        </p>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map((category) => (
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-slate-500">
            Loading events...
          </div>
        ) : null}

        {filteredEvents.map((event, index) => (
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

      {!isLoading && filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-100 bg-white py-20 text-center">
          <p className="text-lg text-slate-500">
            No events found matching your criteria.
          </p>
        </div>
      ) : null}
    </div>
  );
};
