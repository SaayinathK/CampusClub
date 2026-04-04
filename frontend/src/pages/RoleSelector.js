import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const roles = [
  {
    role: 'student',
    title: 'Student Portal',
    description:
      'Register for events, follow campus updates, and manage your activity in one place.',
    icon: GraduationCap,
    iconWrapperClass: 'bg-sky-100 text-sky-600',
    cardHoverClass: 'hover:border-sky-500'
  },
  {
    role: 'admin',
    title: 'Admin Portal',
    description:
      'Control event operations, manage communities, and review registration activity.',
    icon: ShieldCheck,
    iconWrapperClass: 'bg-slate-100 text-slate-800',
    cardHoverClass: 'hover:border-slate-800'
  }
];

export const RoleSelector = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(135deg,_#f8fafc_0%,_#dbeafe_50%,_#f8fafc_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-600 shadow-lg">
            <span className="text-3xl font-bold text-white">U</span>
          </div>
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            UniConnect Access Portal
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Choose the portal you need, then log in or create an account for that role.
          </p>
        </div>

        <div className="grid w-full gap-6 md:grid-cols-2">
          {roles.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.role}
                whileHover={{
                  y: -6
                }}
                whileTap={{
                  scale: 0.99
                }}
              >
                <Card
                  className={`h-full border-2 border-transparent bg-white/85 shadow-xl backdrop-blur ${item.cardHoverClass} transition-colors`}
                >
                  <CardContent className="flex h-full flex-col p-8 text-center">
                    <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${item.iconWrapperClass}`}>
                      <Icon size={32} />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {item.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      <Link
                        to={`/login/${item.role}`}
                        className="rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                      >
                        Login
                      </Link>
                      <Link
                        to={`/register/${item.role}`}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Register
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>);

};
