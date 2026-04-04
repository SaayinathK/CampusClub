import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Bell,
  Calendar,
  Clock,
  Info,
  Plus,
  Send
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { createNotification } from '../../lib/notificationApi';
import { getCommunities } from '../../lib/communityApi';
import { getEvents } from '../../lib/eventApi';
import {
  getFirstValidationError,
  hasValidationErrors,
  validateNotificationForm
} from '../../lib/validation';

const initialValues = {
  title: '',
  message: '',
  audienceType: 'All Students',
  type: 'Event Update',
  communityId: '',
  eventId: ''
};

const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export const AdminNotifications = () => {
  const { token } = useAuth();
  const {
    notifications,
    isLoading,
    upsertNotification
  } = useNotifications();
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getCommunities(token), getEvents(token)])
      .then(([communitiesResponse, eventsResponse]) => {
        if (!isMounted) {
          return;
        }

        setCommunities(
          communitiesResponse.communities.filter(
            (community) => community.status === 'Active'
          )
        );
        setEvents(eventsResponse.events);
      })
      .catch((error) => {
        if (isMounted) {
          toast.error(error.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingData(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: value,
      ...(name === 'audienceType' && value !== 'Specific Community' ? { communityId: '' } : {}),
      ...(name === 'audienceType' && value !== 'Event Registrants' ? { eventId: '' } : {})
    }));
    setFieldErrors((current) => ({
      ...current,
      [name]: '',
      ...(name === 'audienceType' && value !== 'Specific Community' ? { communityId: '' } : {}),
      ...(name === 'audienceType' && value !== 'Event Registrants' ? { eventId: '' } : {})
    }));
  };

  const handleSend = async () => {
    const validationErrors = validateNotificationForm(formValues);

    if (hasValidationErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      toast.error(getFirstValidationError(validationErrors));
      return;
    }

    setFieldErrors({});
    setIsSending(true);

    try {
      const response = await createNotification(formValues, token);
      upsertNotification(response.notification);
      setFormValues(initialValues);
      setFieldErrors({});
      setShowForm(false);
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Event Update':
        return (
          <Badge variant="primary" leftIcon={<Calendar className="h-3 w-3" />}>
            Event Update
          </Badge>
        );
      case 'Reminder':
        return (
          <Badge variant="warning" leftIcon={<Bell className="h-3 w-3" />}>
            Reminder
          </Badge>
        );
      case 'Alert':
        return (
          <Badge variant="danger" leftIcon={<AlertCircle className="h-3 w-3" />}>
            Alert
          </Badge>
        );
      default:
        return (
          <Badge
            variant="default"
            className="bg-purple-100 text-purple-700"
            leftIcon={<Info className="h-3 w-3" />}
          >
            System
          </Badge>
        );
    }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Notification Management
          </h1>
          <p className="mt-1 text-slate-500">
            Send announcements in-app and by Mailjet email.
          </p>
        </div>
        <Button onClick={() => setShowForm((current) => !current)}>
          {showForm ?
            'Cancel' :
            <>
              <Plus className="mr-2 h-4 w-4" />
              Send New Notification
            </>}
        </Button>
      </div>

      {showForm ? (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card className="border-primary-100 shadow-md">
            <CardHeader>
              <CardTitle>Compose Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  name="title"
                  value={formValues.title}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.title ? 'input-error' : ''}`}
                  placeholder="Event reminder"
                  aria-invalid={Boolean(fieldErrors.title)}
                />
                {fieldErrors.title ? <p className="field-error">{fieldErrors.title}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formValues.message}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.message ? 'input-error' : ''}`}
                  placeholder="Type your announcement here..."
                  aria-invalid={Boolean(fieldErrors.message)}
                />
                {fieldErrors.message ? (
                  <p className="field-error">{fieldErrors.message}</p>
                ) : null}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Target Audience
                  </label>
                  <select
                    name="audienceType"
                    value={formValues.audienceType}
                    onChange={handleChange}
                    className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.audienceType ? 'input-error' : ''}`}
                    aria-invalid={Boolean(fieldErrors.audienceType)}
                  >
                    <option value="All Students">All Students</option>
                    <option value="Specific Community">Specific Community</option>
                    <option value="Event Registrants">Event Registrants</option>
                  </select>
                  {fieldErrors.audienceType ? (
                    <p className="field-error">{fieldErrors.audienceType}</p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Notification Type
                  </label>
                  <select
                    name="type"
                    value={formValues.type}
                    onChange={handleChange}
                    className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.type ? 'input-error' : ''}`}
                    aria-invalid={Boolean(fieldErrors.type)}
                  >
                    <option value="Event Update">Event Update</option>
                    <option value="Reminder">Reminder</option>
                    <option value="Alert">Alert</option>
                    <option value="System">System</option>
                  </select>
                  {fieldErrors.type ? <p className="field-error">{fieldErrors.type}</p> : null}
                </div>
              </div>

              {formValues.audienceType === 'Specific Community' ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Community
                  </label>
                  <select
                    name="communityId"
                    value={formValues.communityId}
                    onChange={handleChange}
                    className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.communityId ? 'input-error' : ''}`}
                    aria-invalid={Boolean(fieldErrors.communityId)}
                  >
                    <option value="">Select a community</option>
                    {communities.map((community) => (
                      <option key={community._id} value={community._id}>
                        {community.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.communityId ? (
                    <p className="field-error">{fieldErrors.communityId}</p>
                  ) : null}
                </div>
              ) : null}

              {formValues.audienceType === 'Event Registrants' ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Event
                  </label>
                  <select
                    name="eventId"
                    value={formValues.eventId}
                    onChange={handleChange}
                    className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.eventId ? 'input-error' : ''}`}
                    aria-invalid={Boolean(fieldErrors.eventId)}
                  >
                    <option value="">Select an event</option>
                    {events.map((event) => (
                      <option key={event._id} value={event._id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.eventId ? <p className="field-error">{fieldErrors.eventId}</p> : null}
                </div>
              ) : null}

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSend}
                  isLoading={isSending}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Send Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Sent Notifications</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-y border-gray-100 bg-gray-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Audience</th>
                <th className="px-6 py-4 font-medium">Sent Date</th>
                <th className="px-6 py-4 font-medium">Recipients</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notifications.map((notification, index) => (
                <motion.tr
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="hover:bg-gray-50/50"
                >
                  <td className="max-w-md px-6 py-4">
                    <p className="font-medium text-slate-900">{notification.title}</p>
                    <p className="mt-1 truncate text-slate-500">
                      {notification.message}
                    </p>
                  </td>
                  <td className="px-6 py-4">{getTypeBadge(notification.type)}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {notification.audienceLabel}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDateTime(notification.createdAt)}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {notification.recipientsCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(notification)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {isLoading || isLoadingData ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading notifications...
            </div>
          ) : null}

          {!isLoading && !isLoadingData && notifications.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No notifications have been sent yet.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
};
