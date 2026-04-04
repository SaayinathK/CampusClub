import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  cancelRegistration,
  getMyRegistrations
} from '../../lib/registrationApi';

const formatRegistrationDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

export const Registrations = () => {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getMyRegistrations(token)
      .then((response) => {
        if (isMounted) {
          setRegistrations(response.registrations);
        }
      })
      .catch((error) => {
        if (isMounted) {
          toast.error(error.message);
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

  const filteredRegistrations = registrations.filter(
    (registration) => filter === 'All' || registration.status === filter
  );

  const handleCancel = async (registrationId) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    try {
      const response = await cancelRegistration(registrationId, token);
      setRegistrations((current) =>
        current.map((registration) =>
          registration._id === registrationId ?
          response.registration :
          registration
        )
      );
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Registered':
        return <Badge variant="primary">Registered</Badge>;
      case 'Attended':
        return <Badge variant="success">Attended</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'Free':
        return <Badge variant="default">Free</Badge>;
      case 'Paid':
        return <Badge variant="success">Paid</Badge>;
      case 'Pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Registrations</h1>
        <p className="mt-1 text-slate-500">
          Manage your event registrations and history.
        </p>
      </div>

      <Card>
        <div className="flex gap-2 overflow-x-auto border-b border-gray-100 bg-gray-50/50 p-4 scrollbar-hide">
          {['All', 'Registered', 'Attended', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-slate-900 text-white'
                  : 'border border-gray-200 bg-white text-slate-600 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading registrations...
            </div>
          ) : null}

          {!isLoading && filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                <Calendar className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="mb-1 text-lg font-medium text-slate-900">
                No registrations found
              </h3>
              <p className="text-slate-500">
                You don&apos;t have any {filter !== 'All' ? filter.toLowerCase() : ''}{' '}
                registrations.
              </p>
              <Button asChild className="mt-4">
                <Link to="/events">Browse Events</Link>
              </Button>
            </div>
          ) : null}

          {filteredRegistrations.map((registration, index) => {
            const event = registration.event;

            return (
              <motion.div
                key={registration._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col gap-6 p-4 transition-colors hover:bg-gray-50/50 sm:flex-row sm:p-6"
              >
                <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-xl sm:w-48">
                  <img
                    src={
                      event.imageUrl ||
                      `https://picsum.photos/seed/${event._id}/400/200`
                    }
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute left-2 top-2">
                    {getStatusBadge(registration.status)}
                  </div>
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        to={`/events/${event._id}`}
                        className="line-clamp-1 text-lg font-bold text-slate-900 transition-colors hover:text-primary-600"
                      >
                        {event.title}
                      </Link>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                          {formatRegistrationDate(event.eventDate)} at {event.time}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                          {event.venue}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Users className="mr-2 h-4 w-4 text-slate-400" />
                          {event.community?.name || 'Campus Event'}
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      {getPaymentBadge(registration.paymentStatus)}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-4 sm:justify-end">
                    <div className="sm:hidden">
                      {getPaymentBadge(registration.paymentStatus)}
                    </div>
                    {registration.status === 'Registered' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(registration._id)}
                        className="border-danger-200 text-danger-600 hover:border-danger-300 hover:bg-danger-50"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
