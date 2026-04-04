import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAllRegistrations,
  updateRegistrationStatus
} from '../../lib/registrationApi';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

export const RegistrationManagement = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    let isMounted = true;

    getAllRegistrations(token)
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

  const filteredRegistrations = registrations.filter((registration) =>
    registration.student?.name?.
      toLowerCase().
      includes(searchTerm.toLowerCase()) ||
    registration.event?.title?.
      toLowerCase().
      includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (registrationId, status) => {
    setUpdatingId(registrationId);

    try {
      const response = await updateRegistrationStatus(
        registrationId,
        status,
        token
      );
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
    } finally {
      setUpdatingId('');
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Registration Management
          </h1>
          <p className="mt-1 text-slate-500">
            View and manage student registrations across all events.
          </p>
        </div>
        <Button
          variant="outline"
          leftIcon={<Download className="h-4 w-4" />}
          disabled
        >
          Export to Excel
        </Button>
      </div>

      <Card>
        <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50 p-4 sm:flex-row">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students or events..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto" disabled>
            <Filter className="mr-2 h-4 w-4" />
            Filter by Event
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Event</th>
                <th className="px-6 py-4 font-medium">Reg. Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRegistrations.map((registration, index) => (
                <motion.tr
                  key={registration._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">
                      {registration.student?.name || 'Unknown Student'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {registration.student?.email || 'No email'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {registration.event?.title || 'Unknown Event'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDate(registration.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(registration.status)}
                  </td>
                  <td className="px-6 py-4">
                    {getPaymentBadge(registration.paymentStatus)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={registration.status}
                      disabled={updatingId === registration._id}
                      onChange={(event) =>
                        handleStatusChange(
                          registration._id,
                          event.target.value
                        )
                      }
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Registered">Registered</option>
                      <option value="Attended">Attended</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading registrations...
            </div>
          ) : null}

          {!isLoading && filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No registrations found.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
};
