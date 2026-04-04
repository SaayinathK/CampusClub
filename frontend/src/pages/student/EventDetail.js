import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  MapPin,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { getEventById } from '../../lib/eventApi';
import {
  cancelRegistration,
  createRegistration,
  getMyRegistrations
} from '../../lib/registrationApi';

const formatEventDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

export const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getEventById(id, token), getMyRegistrations(token, { eventId: id })])
      .then(([eventResponse, registrationsResponse]) => {
        if (!isMounted) {
          return;
        }

        setEvent(eventResponse.event);
        setRegistration(registrationsResponse.registrations[0] || null);
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
  }, [id, token]);

  const handleRegistrationAction = async () => {
    if (!event) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (registration && registration.status !== 'Cancelled') {
        const response = await cancelRegistration(registration._id, token);
        setRegistration(response.registration);
        setEvent((current) =>
          current ?
          {
            ...current,
            registeredCount: Math.max(current.registeredCount - 1, 0)
          } :
          current
        );
        toast.success(response.message);
      } else {
        const response = await createRegistration(event._id, token);
        setRegistration(response.registration);
        setEvent((current) =>
          current ?
          {
            ...current,
            registeredCount: current.registeredCount + 1
          } :
          current
        );
        toast.success(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-slate-500">
          Loading event...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-slate-500">
          Event not found.
        </div>
      </div>
    );
  }

  const occupancyRate = event.registeredCount / event.capacity;
  const isRegistered = registration && registration.status !== 'Cancelled';
  let progressColor = 'bg-success-500';

  if (occupancyRate > 0.9) {
    progressColor = 'bg-danger-500';
  } else if (occupancyRate > 0.7) {
    progressColor = 'bg-warning-500';
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to events
      </button>

      <div className="relative h-64 w-full overflow-hidden rounded-2xl shadow-sm md:h-96">
        <img
          src={event.imageUrl || `https://picsum.photos/seed/${event._id}/1200/400`}
          alt={event.title}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div className="flex gap-2">
            <Badge className="border-none bg-white/90 text-slate-800 backdrop-blur-sm">
              {event.category}
            </Badge>
            <Badge variant={event.status === 'Published' ? 'success' : 'warning'}>
              {event.status}
            </Badge>
          </div>
          <div className="flex gap-2">
            <button className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div>
            <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              {event.title}
            </h1>
            <p className="text-lg leading-relaxed text-slate-600">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Date</p>
                  <p className="font-semibold text-slate-900">
                    {formatEventDate(event.eventDate)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Time</p>
                  <p className="font-semibold text-slate-900">{event.time}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Venue</p>
                  <p className="font-semibold text-slate-900">{event.venue}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              About the Organizer
            </h2>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <img
                  src={
                    event.community?.imageUrl ||
                    `https://picsum.photos/seed/${event.community?._id || event._id}/64/64`
                  }
                  alt={event.community?.name || 'Organizer'}
                  className="h-16 w-16 rounded-full border border-gray-100 object-cover"
                />

                <div>
                  <h3 className="font-bold text-slate-900">
                    {event.community?.name || 'Campus Event'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {event.community?.description ||
                      'Organizing community information is not available yet.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardContent className="space-y-6 p-6">
              <div>
                <div className="mb-2 flex items-end justify-between">
                  <h3 className="font-bold text-slate-900">Registration</h3>
                  <span className="text-sm font-medium text-slate-500">
                    {event.registeredCount} / {event.capacity} spots
                  </span>
                </div>
                <div className="mb-2 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full ${progressColor}`}
                    style={{ width: `${Math.min(occupancyRate * 100, 100)}%` }}
                  />
                </div>
                {occupancyRate > 0.9 ? (
                  <p className="mt-2 flex items-center text-sm font-medium text-danger-600">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    Almost full!
                  </p>
                ) : null}
              </div>

              <div className="border-t border-gray-100 pt-4">
                {isRegistered ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-lg bg-success-50 p-3 text-success-700">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-bold">You&apos;re registered!</p>
                        <p className="mt-1">Current status: {registration.status}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleRegistrationAction}
                      isLoading={isSubmitting}
                    >
                      Cancel Registration
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="h-12 w-full text-lg"
                    onClick={handleRegistrationAction}
                    isLoading={isSubmitting}
                    disabled={
                      event.registeredCount >= event.capacity ||
                      event.status !== 'Published'
                    }
                  >
                    {event.registeredCount >= event.capacity ?
                      'Event Full' :
                      event.status !== 'Published' ?
                      'Not Open for Registration' :
                      'Register Now'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
