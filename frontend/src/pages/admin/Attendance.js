import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Users,
  UserCheck,
  UserX } from
'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle } from
'../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
const mockEvents = [
{
  id: 'e1',
  name: 'Tech Symposium 2026',
  date: 'Oct 12, 2026'
},
{
  id: 'e2',
  name: 'Design Workshop: UI/UX',
  date: 'Oct 15, 2026'
},
{
  id: 'e3',
  name: 'Startup Pitch Competition',
  date: 'Oct 25, 2026'
}];

const mockParticipants = {
  e1: [
  {
    id: 'p1',
    name: 'Alex Johnson',
    email: 'alex.j@university.edu',
    regStatus: 'Registered',
    attendance: 'Present'
  },
  {
    id: 'p2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@university.edu',
    regStatus: 'Registered',
    attendance: 'Pending'
  },
  {
    id: 'p3',
    name: 'Mike Chen',
    email: 'mike.c@university.edu',
    regStatus: 'Registered',
    attendance: 'Absent'
  },
  {
    id: 'p4',
    name: 'Emma Wilson',
    email: 'emma.w@university.edu',
    regStatus: 'Registered',
    attendance: 'Present'
  },
  {
    id: 'p5',
    name: 'David Kim',
    email: 'david.k@university.edu',
    regStatus: 'Registered',
    attendance: 'Pending'
  }],

  e2: [
  {
    id: 'p6',
    name: 'Lisa Ray',
    email: 'lisa.r@university.edu',
    regStatus: 'Registered',
    attendance: 'Present'
  },
  {
    id: 'p7',
    name: 'Tom Hardy',
    email: 'tom.h@university.edu',
    regStatus: 'Registered',
    attendance: 'Present'
  },
  {
    id: 'p8',
    name: 'Nina Dobrev',
    email: 'nina.d@university.edu',
    regStatus: 'Registered',
    attendance: 'Absent'
  }],

  e3: [
  {
    id: 'p9',
    name: 'Chris Evans',
    email: 'chris.e@university.edu',
    regStatus: 'Registered',
    attendance: 'Pending'
  },
  {
    id: 'p10',
    name: 'Mark Ruffalo',
    email: 'mark.r@university.edu',
    regStatus: 'Registered',
    attendance: 'Pending'
  }]

};
export const Attendance = () => {
  const [selectedEvent, setSelectedEvent] = useState(mockEvents[0].id);
  const [participants, setParticipants] = useState(mockParticipants);
  const [searchTerm, setSearchTerm] = useState('');
  const currentParticipants = participants[selectedEvent] ?? [];
  const filteredParticipants = currentParticipants.filter(
    (p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const stats = {
    total: currentParticipants.length,
    present: currentParticipants.filter((p) => p.attendance === 'Present').
    length,
    absent: currentParticipants.filter((p) => p.attendance === 'Absent').length
  };
  const toggleAttendance = (participantId, status) => {
    setParticipants((prev) => ({
      ...prev,
      [selectedEvent]: (prev[selectedEvent] ?? []).map(
        (p) =>
        p.id === participantId ?
        {
          ...p,
          attendance: status
        } :
        p
      )
    }));
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Attendance Management
          </h1>
          <p className="text-slate-500 mt-1">
            Track and manage event attendance.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <select
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}>
            
            {mockEvents.map((e) =>
            <option key={e.id} value={e.id}>
                {e.name} ({e.date})
              </option>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Registered
              </p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Present</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.present}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Absent</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.absent}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Participant</th>
                  <th className="px-6 py-4 font-medium">Registration</th>
                  <th className="px-6 py-4 font-medium">Attendance</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredParticipants.map((p, i) =>
                <motion.tr
                  key={p.id}
                  initial={{
                    opacity: 0,
                    y: 10
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    delay: i * 0.05
                  }}
                  className="hover:bg-gray-50/50 transition-colors">
                  
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-500">{p.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="primary">{p.regStatus}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {p.attendance === 'Present' &&
                    <Badge
                      variant="success"
                      leftIcon={<CheckCircle2 className="w-3 h-3" />}>
                      
                          Present
                        </Badge>
                    }
                      {p.attendance === 'Absent' &&
                    <Badge
                      variant="danger"
                      leftIcon={<XCircle className="w-3 h-3" />}>
                      
                          Absent
                        </Badge>
                    }
                      {p.attendance === 'Pending' &&
                    <Badge
                      variant="default"
                      leftIcon={<Clock className="w-3 h-3" />}>
                      
                          Pending
                        </Badge>
                    }
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                        onClick={() => toggleAttendance(p.id, 'Present')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${p.attendance === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}>
                        
                          Mark Present
                        </button>
                        <button
                        onClick={() => toggleAttendance(p.id, 'Absent')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${p.attendance === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}>
                        
                          Mark Absent
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )}
                {filteredParticipants.length === 0 &&
                <tr>
                    <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500">
                    
                      No participants found matching your search.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Quick Scan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center p-8">
            <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center mb-6">
              <QrCode className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Scan QR Code
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Use your device camera to quickly scan student tickets and mark
              attendance.
            </p>
            <Button
              className="w-full"
              leftIcon={<QrCode className="w-4 h-4" />}>
              
              Open Scanner
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>);

};
