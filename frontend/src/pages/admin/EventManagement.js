import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { getCommunities } from '../../lib/communityApi';
import { createEvent, deleteEvent, getEvents, updateEvent } from '../../lib/eventApi';
import {
  getFirstValidationError,
  hasValidationErrors,
  validateEventForm
} from '../../lib/validation';

const initialFormValues = {
  title: '',
  description: '',
  eventDate: '',
  time: '',
  venue: '',
  category: '',
  capacity: 100,
  status: 'Published',
  communityId: '',
  image: null
};

const formatEventDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

function buildEditFormValues(event) {
  return {
    title: event.title || '',
    description: event.description || '',
    eventDate: event.eventDate ? String(event.eventDate).slice(0, 10) : '',
    time: event.time || '',
    venue: event.venue || '',
    category: event.category || '',
    capacity: event.capacity || 1,
    status: event.status || 'Published',
    communityId: event.community?._id || '',
    image: null
  };
}

export const EventManagement = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [events, setEvents] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState('');
  const [editingEventId, setEditingEventId] = useState('');
  const [deletingEventId, setDeletingEventId] = useState('');

  useEffect(() => {
    let isMounted = true;

    Promise.all([getEvents(token), getCommunities(token)])
      .then(([eventsResponse, communitiesResponse]) => {
        if (!isMounted) {
          return;
        }

        setEvents(eventsResponse.events);

        const activeCommunities = communitiesResponse.communities.filter(
          (community) => community.status === 'Active'
        );

        setCommunities(activeCommunities);
        setFormValues((current) => ({
          ...current,
          communityId: current.communityId || activeCommunities[0]?._id || ''
        }));
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

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.community?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormValues((current) => ({
      ...initialFormValues,
      communityId: communities[0]?._id || current.communityId || ''
    }));
    setFieldErrors({});
    setSelectedImageName('');
    setEditingEventId('');
    setShowForm(false);
  };

  const openCreateForm = () => {
    setFormValues({
      ...initialFormValues,
      communityId: communities[0]?._id || ''
    });
    setFieldErrors({});
    setSelectedImageName('');
    setEditingEventId('');
    setShowForm(true);
  };

  const openEditForm = (event) => {
    setFormValues(buildEditFormValues(event));
    setFieldErrors({});
    setSelectedImageName('');
    setEditingEventId(event._id);
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: name === 'capacity' ? Math.max(Number(value) || 1, 1) : value
    }));
    setFieldErrors((current) => ({
      ...current,
      [name]: ''
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    setFormValues((current) => ({
      ...current,
      image: file
    }));
    setFieldErrors((current) => ({
      ...current,
      image: ''
    }));
    setSelectedImageName(file ? file.name : '');
  };

  const sortEvents = (items) =>
    [...items].sort((left, right) => new Date(left.eventDate) - new Date(right.eventDate));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateEventForm(formValues);

    if (hasValidationErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      toast.error(getFirstValidationError(validationErrors));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = editingEventId
        ? await updateEvent(editingEventId, formValues, token)
        : await createEvent(formValues, token);

      setEvents((current) => {
        if (!editingEventId) {
          return sortEvents([...current, response.event]);
        }

        return sortEvents(
          current.map((item) =>
            item._id === editingEventId ? response.event : item
          )
        );
      });

      resetForm();
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      'Delete this event? Related registrations will also be removed.'
    );

    if (!confirmed) {
      return;
    }

    setDeletingEventId(eventId);

    try {
      const response = await deleteEvent(eventId, token);
      setEvents((current) => current.filter((item) => item._id !== eventId));

      if (editingEventId === eventId) {
        resetForm();
      }

      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingEventId('');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Published':
        return <Badge variant="success">Published</Badge>;
      case 'Draft':
        return <Badge variant="warning">Draft</Badge>;
      case 'Completed':
        return <Badge variant="default">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Event Management
          </h1>
          <p className="mt-1 text-slate-500">
            Create new events, update details, and delete old events.
          </p>
        </div>
        <Button onClick={() => (showForm ? resetForm() : openCreateForm())}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Close Form' : 'Create New Event'}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardContent className="p-6">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Event Title
                </label>
                <input
                  name="title"
                  value={formValues.title}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.title ? 'input-error' : ''}`}
                  placeholder="Tech Symposium 2026"
                  aria-invalid={Boolean(fieldErrors.title)}
                  required
                />
                {fieldErrors.title ? <p className="field-error">{fieldErrors.title}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Community
                </label>
                <select
                  name="communityId"
                  value={formValues.communityId}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.communityId ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.communityId)}
                  required
                >
                  {communities.length === 0 ? (
                    <option value="">No active communities available</option>
                  ) : null}
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

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Event Date
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formValues.eventDate}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.eventDate ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.eventDate)}
                  required
                />
                {fieldErrors.eventDate ? (
                  <p className="field-error">{fieldErrors.eventDate}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formValues.time}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.time ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.time)}
                  required
                />
                {fieldErrors.time ? <p className="field-error">{fieldErrors.time}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Venue
                </label>
                <input
                  name="venue"
                  value={formValues.venue}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.venue ? 'input-error' : ''}`}
                  placeholder="Main Auditorium"
                  aria-invalid={Boolean(fieldErrors.venue)}
                  required
                />
                {fieldErrors.venue ? <p className="field-error">{fieldErrors.venue}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category
                </label>
                <input
                  name="category"
                  value={formValues.category}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.category ? 'input-error' : ''}`}
                  placeholder="Academic"
                  aria-invalid={Boolean(fieldErrors.category)}
                  required
                />
                {fieldErrors.category ? (
                  <p className="field-error">{fieldErrors.category}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  name="capacity"
                  value={formValues.capacity}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.capacity ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.capacity)}
                  required
                />
                {fieldErrors.capacity ? (
                  <p className="field-error">{fieldErrors.capacity}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formValues.status}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.status ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.status)}
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Completed">Completed</option>
                </select>
                {fieldErrors.status ? <p className="field-error">{fieldErrors.status}</p> : null}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Event Banner
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.image ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.image)}
                />
                <p className="mt-2 text-xs text-slate-500">
                  {selectedImageName ||
                    (editingEventId
                      ? 'Leave empty to keep the current banner.'
                      : 'Upload an image for the event card.')}
                </p>
                {fieldErrors.image ? <p className="field-error">{fieldErrors.image}</p> : null}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formValues.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.description ? 'input-error' : ''}`}
                  placeholder="Describe the event and what students can expect."
                  aria-invalid={Boolean(fieldErrors.description)}
                  required
                />
                {fieldErrors.description ? (
                  <p className="field-error">{fieldErrors.description}</p>
                ) : null}
              </div>

              <div className="md:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {editingEventId ? 'Update Event' : 'Save Event'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events or communities..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="scrollbar-hide flex w-full gap-2 overflow-x-auto pb-2 sm:w-auto sm:pb-0">
            {['All', 'Published', 'Draft', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-slate-800 text-white'
                    : 'border border-gray-200 bg-white text-slate-600 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Event Details</th>
                <th className="px-6 py-4 font-medium">Community</th>
                <th className="px-6 py-4 font-medium">Registration</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEvents.map((event, index) => (
                <motion.tr
                  key={event._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4">
                    <div className="mb-1 font-semibold text-slate-900">
                      {event.title}
                    </div>
                    <div className="flex gap-3 text-xs text-slate-500">
                      <span className="flex items-center">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {formatEventDate(event.eventDate)}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {event.venue}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {event.community?.name || 'Unknown Community'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="mb-1 flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        {event.registeredCount}
                      </span>
                      <span className="text-slate-400">/ {event.capacity}</span>
                    </div>
                    <div className="h-1.5 w-24 rounded-full bg-gray-200">
                      <div
                        className={`h-1.5 rounded-full ${
                          event.registeredCount / event.capacity > 0.9
                            ? 'bg-danger-500'
                            : 'bg-primary-500'
                        }`}
                        style={{
                          width: `${Math.max(
                            event.capacity > 0
                              ? (event.registeredCount / event.capacity) * 100
                              : 0,
                            event.registeredCount > 0 ? 5 : 0
                          )}%`
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(event.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditForm(event)}
                        leftIcon={<Pencil className="h-3.5 w-3.5" />}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        isLoading={deletingEventId === event._id}
                        onClick={() => handleDelete(event._id)}
                        leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {!isLoading && filteredEvents.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <h3 className="mb-1 text-lg font-medium text-slate-900">
                No events found
              </h3>
              <p className="text-slate-500">
                Create a new event or adjust your filters.
              </p>
            </div>
          ) : null}

          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading events...
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
};
