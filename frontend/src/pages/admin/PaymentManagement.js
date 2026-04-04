import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
const mockPayments = [
{
  id: '1',
  studentName: 'Sarah Smith',
  event: 'UI/UX Design Masterclass',
  amount: '$50.00',
  date: 'Oct 02, 2026',
  status: 'Pending'
},
{
  id: '2',
  studentName: 'Mike Chen',
  event: 'Startup Pitch Competition',
  amount: '$25.00',
  date: 'Sep 28, 2026',
  status: 'Approved'
},
{
  id: '3',
  studentName: 'Emma Wilson',
  event: 'Winter Gala',
  amount: '$100.00',
  date: 'Oct 05, 2026',
  status: 'Rejected'
}];

export const PaymentManagement = () => {
  const [payments, setPayments] = useState(mockPayments);
  const handleApprove = (id) => {
    setPayments(
      payments.map((p) =>
      p.id === id ?
      {
        ...p,
        status: 'Approved'
      } :
      p
      )
    );
  };
  const handleReject = (id) => {
    setPayments(
      payments.map((p) =>
      p.id === id ?
      {
        ...p,
        status: 'Rejected'
      } :
      p
      )
    );
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Payment Management
        </h1>
        <p className="text-slate-500 mt-1">
          Verify and approve uploaded payment receipts.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Event</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Receipt</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment, i) =>
              <motion.tr
                key={payment.id}
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
                
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {payment.studentName}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{payment.event}</td>
                  <td className="px-6 py-4 font-medium">{payment.amount}</td>
                  <td className="px-6 py-4">
                    <button className="flex items-center text-primary-600 hover:text-primary-700 font-medium">
                      <FileText className="w-4 h-4 mr-1" /> View
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                    variant={
                    payment.status === 'Approved' ?
                    'success' :
                    payment.status === 'Rejected' ?
                    'danger' :
                    'warning'
                    }>
                    
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payment.status === 'Pending' &&
                  <div className="flex items-center justify-end gap-2">
                        <button
                      onClick={() => handleApprove(payment.id)}
                      className="p-1.5 text-success-600 hover:bg-success-50 rounded-md transition-colors"
                      title="Approve">
                      
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                      onClick={() => handleReject(payment.id)}
                      className="p-1.5 text-danger-600 hover:bg-danger-50 rounded-md transition-colors"
                      title="Reject">
                      
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                  }
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>);

};
