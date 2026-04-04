import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ClipboardList,
  MoreHorizontal,
  Users
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardOverview } from '../../lib/adminInsightsApi';

const iconMap = {
  'Total Events': {
    icon: Calendar,
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  'Total Registrations': {
    icon: ClipboardList,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100'
  },
  'Active Communities': {
    icon: Users,
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  },
  'Student Accounts': {
    icon: Users,
    color: 'text-amber-600',
    bg: 'bg-amber-100'
  }
};

const formatDate = (value) =>
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

export const AdminDashboard = () => {
  const { token } = useAuth();
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getDashboardOverview(token)
      .then((response) => {
        if (isMounted) {
          setOverview(response);
        }
      })
      .catch((error) => {
        if (isMounted) {
          toast.error(error.message);
          setOverview(null);
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-slate-500">
          Loading dashboard overview...
        </CardContent>
      </Card>
    );
  }

  const kpis = overview?.kpis || [];
  const chartData = overview?.chartData || [];
  const recentActivity = overview?.recentActivity || [];
  const upcomingEvents = overview?.upcomingEvents || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Overview
          </h1>
          <p className="text-slate-500">
            Live platform activity across events, communities, and registrations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link to="/admin/reports">Download Report</Link>
          </Button>
          <Button asChild>
            <Link to="/admin/events">Create Event</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => {
          const meta = iconMap[kpi.title] || iconMap['Total Events'];
          const Icon = meta.icon;

          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="mb-1 text-sm font-medium text-slate-500">
                        {kpi.title}
                      </p>
                      <h3 className="text-2xl font-bold text-slate-900">
                        {Number(kpi.value).toLocaleString()}
                      </h3>
                    </div>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${meta.bg} ${meta.color}`}
                    >
                      <Icon size={20} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span
                      className={`flex items-center font-medium ${
                        kpi.trend === 'up' ? 'text-success-600' : 'text-danger-600'
                      }`}
                    >
                      {kpi.trend === 'up' ? (
                        <ArrowUpRight size={16} className="mr-1" />
                      ) : (
                        <ArrowDownRight size={16} className="mr-1" />
                      )}
                      {kpi.change}
                    </span>
                    <span className="ml-2 text-slate-500">vs previous 30 days</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Registrations vs Attendance</CardTitle>
            <button className="rounded p-1 text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={20} />
            </button>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="registrations"
                    name="Registrations"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="attendance"
                    name="Attendance"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="relative flex gap-4">
                  {index !== recentActivity.length - 1 ? (
                    <div className="absolute bottom-[-24px] left-4 top-10 w-px bg-gray-200"></div>
                  ) : null}
                  <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-100 text-xs font-semibold text-primary-700 shadow-sm">
                    {activity.actor.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-slate-800">
                      <span className="font-semibold">{activity.actor}</span>{' '}
                      {activity.action}{' '}
                      <span className="font-medium text-primary-600">
                        {activity.target}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}

              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500">
                  New admin and student activity will appear here.
                </p>
              ) : null}
            </div>
            <Button className="mt-6 w-full" variant="outline" asChild>
              <Link to="/admin/analytics">View analytics</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Events Overview</CardTitle>
            <Link
              to="/admin/events"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all events
            </Link>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-gray-100 bg-gray-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Event Name</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Registrations</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {upcomingEvents.map((event) => (
                  <tr
                    key={event._id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {event.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(event.eventDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-full max-w-[100px] rounded-full bg-gray-200">
                          <div
                            className={`h-1.5 rounded-full ${
                              event.capacity > 0 &&
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
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500">
                          {event.registeredCount}/{event.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          event.status === 'Published' ? 'success' : 'default'
                        }
                      >
                        {event.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/admin/events"
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <MoreHorizontal size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {upcomingEvents.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No upcoming events available yet.
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
};
