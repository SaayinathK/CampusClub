import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import {
  createCommunity,
  deleteCommunity,
  getCommunities,
  updateCommunity
} from '../../lib/communityApi';
import {
  getFirstValidationError,
  hasValidationErrors,
  validateCommunityForm
} from '../../lib/validation';

const initialFormValues = {
  name: '',
  president: '',
  category: '',
  description: '',
  memberCount: 0,
  eventCount: 0,
  status: 'Active',
  image: null
};

function buildEditFormValues(community) {
  return {
    name: community.name || '',
    president: community.president || '',
    category: community.category || '',
    description: community.description || '',
    memberCount: community.memberCount || 0,
    eventCount: community.eventCount || 0,
    status: community.status || 'Active',
    image: null
  };
}

export const CommunityManagement = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState([]);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState('');
  const [editingCommunityId, setEditingCommunityId] = useState('');
  const [deletingCommunityId, setDeletingCommunityId] = useState('');

  useEffect(() => {
    let isMounted = true;

    getCommunities(token)
      .then((response) => {
        if (isMounted) {
          setCommunities(response.communities);
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

  const filteredCommunities = communities.filter((community) =>
    [community.name, community.category, community.president]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormValues(initialFormValues);
    setFieldErrors({});
    setSelectedImageName('');
    setEditingCommunityId('');
    setShowForm(false);
  };

  const openCreateForm = () => {
    setFormValues(initialFormValues);
    setFieldErrors({});
    setSelectedImageName('');
    setEditingCommunityId('');
    setShowForm(true);
  };

  const openEditForm = (community) => {
    setFormValues(buildEditFormValues(community));
    setFieldErrors({});
    setSelectedImageName('');
    setEditingCommunityId(community._id);
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]:
        name === 'memberCount' || name === 'eventCount' ? Math.max(Number(value) || 0, 0) : value
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateCommunityForm(formValues);

    if (hasValidationErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      toast.error(getFirstValidationError(validationErrors));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = editingCommunityId
        ? await updateCommunity(editingCommunityId, formValues, token)
        : await createCommunity(formValues, token);

      setCommunities((current) => {
        if (!editingCommunityId) {
          return [response.community, ...current];
        }

        return current.map((community) =>
          community._id === editingCommunityId ? response.community : community
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

  const handleDelete = async (communityId) => {
    const confirmed = window.confirm(
      'Delete this community? This only works when no events are linked to it.'
    );

    if (!confirmed) {
      return;
    }

    setDeletingCommunityId(communityId);

    try {
      const response = await deleteCommunity(communityId, token);
      setCommunities((current) =>
        current.filter((community) => community._id !== communityId)
      );

      if (editingCommunityId === communityId) {
        resetForm();
      }

      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingCommunityId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Community Management
          </h1>
          <p className="mt-1 text-slate-500">
            Create, update, and delete communities from the admin portal.
          </p>
        </div>
        <Button onClick={() => (showForm ? resetForm() : openCreateForm())}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Close Form' : 'Create Community'}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardContent className="p-6">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Community Name
                </label>
                <input
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.name ? 'input-error' : ''}`}
                  placeholder="Computer Science Society"
                  aria-invalid={Boolean(fieldErrors.name)}
                  required
                />
                {fieldErrors.name ? <p className="field-error">{fieldErrors.name}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  President
                </label>
                <input
                  name="president"
                  value={formValues.president}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.president ? 'input-error' : ''}`}
                  placeholder="Alex Johnson"
                  aria-invalid={Boolean(fieldErrors.president)}
                  required
                />
                {fieldErrors.president ? (
                  <p className="field-error">{fieldErrors.president}</p>
                ) : null}
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
                  Status
                </label>
                <select
                  name="status"
                  value={formValues.status}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.status ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.status)}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </select>
                {fieldErrors.status ? (
                  <p className="field-error">{fieldErrors.status}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Member Count
                </label>
                <input
                  name="memberCount"
                  type="number"
                  min="0"
                  value={formValues.memberCount}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.memberCount ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.memberCount)}
                />
                {fieldErrors.memberCount ? (
                  <p className="field-error">{fieldErrors.memberCount}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Event Count
                </label>
                <input
                  name="eventCount"
                  type="number"
                  min="0"
                  value={formValues.eventCount}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.eventCount ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.eventCount)}
                />
                {fieldErrors.eventCount ? (
                  <p className="field-error">{fieldErrors.eventCount}</p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Community Image
                </label>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldErrors.image ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.image)}
                />
                <p className="mt-2 text-xs text-slate-500">
                  {selectedImageName ||
                    (editingCommunityId
                      ? 'Leave empty to keep the current image.'
                      : 'Upload a JPG, PNG, WEBP, or similar image file.')}
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
                  placeholder="Describe what this community does and who should join."
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
                  {editingCommunityId ? 'Update Community' : 'Save Community'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <div className="border-b border-gray-100 bg-gray-50/60 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Community</th>
                <th className="px-6 py-4 font-medium">President</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Stats</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCommunities.map((community, index) => (
                <motion.tr
                  key={community._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="hover:bg-gray-50/70"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          community.imageUrl ||
                          `https://picsum.photos/seed/${community._id}/80/80`
                        }
                        alt={community.name}
                        className="h-10 w-10 rounded-lg border border-gray-200 object-cover"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {community.name}
                        </p>
                        <p className="line-clamp-2 max-w-xs text-xs text-slate-500">
                          {community.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {community.president}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">{community.category}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        {community.memberCount} members
                      </div>
                      <div>{community.eventCount} events</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        community.status === 'Active' ? 'success' : 'warning'
                      }
                    >
                      {community.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditForm(community)}
                        leftIcon={<Pencil className="h-3.5 w-3.5" />}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        isLoading={deletingCommunityId === community._id}
                        onClick={() => handleDelete(community._id)}
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

          {!isLoading && filteredCommunities.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <h3 className="mb-1 text-lg font-medium text-slate-900">
                No communities found
              </h3>
              <p className="text-slate-500">
                Create a community or adjust your search.
              </p>
            </div>
          ) : null}

          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading communities...
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
};
