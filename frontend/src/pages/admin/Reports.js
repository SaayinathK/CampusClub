import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Calendar,
  Download,
  FileSpreadsheet,
  UserCheck,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import {
  exportReport,
  getReportsSummary
} from '../../lib/adminInsightsApi';
import {
  getFirstValidationError,
  hasValidationErrors,
  validateReportFilters
} from '../../lib/validation';

const reportDefinitions = [
  {
    id: 'registrations',
    title: 'Registration Data',
    desc: 'Export student registrations with event, community, payment, and status data.',
    icon: FileSpreadsheet,
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  {
    id: 'events',
    title: 'Event Directory',
    desc: 'Download event dates, capacities, statuses, and community ownership.',
    icon: Calendar,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100'
  },
  {
    id: 'communities',
    title: 'Community Report',
    desc: 'Export community metadata, member counts, and event totals.',
    icon: Users,
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  },
  {
    id: 'attendance',
    title: 'Attendance Report',
    desc: 'Download all registrations marked as attended for completed participation tracking.',
    icon: UserCheck,
    color: 'text-amber-600',
    bg: 'bg-amber-100'
  },
  {
    id: 'notifications',
    title: 'Notification Log',
    desc: 'Export sent notification records with audience, status, and email delivery flags.',
    icon: Bell,
    color: 'text-rose-600',
    bg: 'bg-rose-100'
  }
];

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const Reports = () => {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: ''
  });
  const [loadingStates, setLoadingStates] = useState({});
  const [summary, setSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const filterErrors = useMemo(() => validateReportFilters(filters), [filters]);

  useEffect(() => {
    let isMounted = true;

    if (hasValidationErrors(filterErrors)) {
      setSummary(null);
      setIsLoadingSummary(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingSummary(true);

    getReportsSummary(token, filters)
      .then((response) => {
        if (isMounted) {
          setSummary(response.reports);
        }
      })
      .catch((error) => {
        if (isMounted) {
          toast.error(error.message);
          setSummary(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingSummary(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filterErrors, filters, token]);

  const reportRows = useMemo(
    () =>
      reportDefinitions.map((report) => ({
        ...report,
        count: summary?.[report.id] || 0
      })),
    [summary]
  );

  const handleExport = async (reportId) => {
    if (hasValidationErrors(filterErrors)) {
      toast.error(getFirstValidationError(filterErrors));
      return;
    }

    setLoadingStates((current) => ({
      ...current,
      [reportId]: true
    }));

    try {
      const result = await exportReport(reportId, token, filters);
      downloadBlob(result.blob, result.filename);
      toast.success('Report exported successfully.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingStates((current) => ({
        ...current,
        [reportId]: false
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Export</h1>
          <p className="mt-1 text-slate-500">
            Generate CSV exports from real MongoDB data.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              From Date
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  fromDate: event.target.value
                }))
              }
              className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${filterErrors.fromDate ? 'input-error' : ''}`}
              aria-invalid={Boolean(filterErrors.fromDate)}
            />
            {filterErrors.fromDate ? (
              <p className="field-error">{filterErrors.fromDate}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              To Date
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  toDate: event.target.value
                }))
              }
              className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${filterErrors.toDate ? 'input-error' : ''}`}
              aria-invalid={Boolean(filterErrors.toDate)}
            />
            {filterErrors.toDate ? (
              <p className="field-error">{filterErrors.toDate}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {reportRows.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="flex h-full flex-col">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-6 flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${report.bg} ${report.color}`}
                  >
                    <report.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {report.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{report.desc}</p>
                  </div>
                </div>

                <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Matching Rows
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {isLoadingSummary ? '...' : report.count.toLocaleString()}
                  </p>
                </div>

                <Button
                  className="mt-auto w-full"
                  variant="secondary"
                  leftIcon={<Download className="h-4 w-4" />}
                  isLoading={loadingStates[report.id]}
                  onClick={() => handleExport(report.id)}
                >
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
