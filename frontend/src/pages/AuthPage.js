import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, GraduationCap, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { getDefaultRoute, isValidRole } from '../lib/auth';
import {
  getFirstValidationError,
  hasValidationErrors,
  validateAuthForm
} from '../lib/validation';

const roleConfig = {
  student: {
    title: 'Student Portal',
    description:
      'Access event registrations, community updates, and your activity dashboard.',
    accentClass: 'from-sky-500 via-cyan-500 to-blue-600',
    icon: GraduationCap
  },
  admin: {
    title: 'Admin Portal',
    description:
      'Manage communities, monitor registrations, and control campus operations.',
    accentClass: 'from-slate-800 via-slate-700 to-slate-600',
    icon: ShieldCheck
  }
};

export function AuthPage({ mode }) {
  const { role = '' } = useParams();
  const navigate = useNavigate();
  const { user, login, register, isInitializing } = useAuth();
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isValidRole(role)) {
    return <Navigate to="/" replace />;
  }

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">
          Loading...
        </div>
      </div>
    );
  }

  if (!isInitializing && user) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  const config = roleConfig[role];
  const Icon = config.icon;
  const isRegisterMode = mode === 'register';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value
    }));
    setFieldErrors((current) => ({
      ...current,
      [name]: ''
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateAuthForm(formValues, {
      mode,
      role
    });

    if (hasValidationErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      toast.error(getFirstValidationError(validationErrors));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        email: formValues.email,
        password: formValues.password,
        role
      };

      const response = isRegisterMode
        ? await register({
            ...payload,
            name: formValues.name
          })
        : await login(payload);

      toast.success(response.message);
      navigate(getDefaultRoute(response.user.role), { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const alternateMode = isRegisterMode ? 'login' : 'register';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_30%),linear-gradient(135deg,_#f8fafc_0%,_#e2e8f0_45%,_#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className={`rounded-[2rem] bg-gradient-to-br ${config.accentClass} p-8 text-white shadow-2xl sm:p-10`}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to role selection
            </Link>

            <div className="mt-16 max-w-lg">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                <Icon className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                {role}
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                {isRegisterMode ? 'Create your account' : 'Sign in securely'}
              </h1>
              <p className="mt-4 max-w-md text-base text-white/80 sm:text-lg">
                {config.description}
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm font-medium">Role-specific access</p>
                  <p className="mt-2 text-sm text-white/75">
                    Each account is tied to its portal and redirected automatically after authentication.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm font-medium">Persistent session</p>
                  <p className="mt-2 text-sm text-white/75">
                    Sessions stay active until logout, with token validation on refresh.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-white/70 bg-white/90 shadow-2xl backdrop-blur">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                  {config.title}
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                  {isRegisterMode ? 'Register' : 'Login'}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {isRegisterMode
                    ? 'Enter your details to create a new account.'
                    : 'Use the account details registered for this portal.'}
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {isRegisterMode ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="name">
                      Full name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formValues.name}
                      onChange={handleChange}
                      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 ${fieldErrors.name ? 'input-error' : ''}`}
                      placeholder="Enter your full name"
                      aria-invalid={Boolean(fieldErrors.name)}
                      required
                    />
                    {fieldErrors.name ? (
                      <p className="field-error">{fieldErrors.name}</p>
                    ) : null}
                  </div>
                ) : null}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleChange}
                    className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 ${fieldErrors.email ? 'input-error' : ''}`}
                    placeholder="name@example.com"
                    aria-invalid={Boolean(fieldErrors.email)}
                    required
                  />
                  {fieldErrors.email ? (
                    <p className="field-error">{fieldErrors.email}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formValues.password}
                    onChange={handleChange}
                    className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 ${fieldErrors.password ? 'input-error' : ''}`}
                    placeholder="At least 6 characters"
                    minLength={6}
                    aria-invalid={Boolean(fieldErrors.password)}
                    required
                  />
                  {fieldErrors.password ? (
                    <p className="field-error">{fieldErrors.password}</p>
                  ) : null}
                </div>

                {isRegisterMode ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formValues.confirmPassword}
                      onChange={handleChange}
                      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Re-enter your password"
                      minLength={6}
                      aria-invalid={Boolean(fieldErrors.confirmPassword)}
                      required
                    />
                    {fieldErrors.confirmPassword ? (
                      <p className="field-error">{fieldErrors.confirmPassword}</p>
                    ) : null}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl"
                  isLoading={isSubmitting}
                >
                  {isRegisterMode ? 'Create account' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {isRegisterMode ? 'Already registered?' : 'Need a new account?'}{' '}
                <Link
                  to={`/${alternateMode}/${role}`}
                  className="font-semibold text-sky-700 transition hover:text-sky-800"
                >
                  {isRegisterMode ? 'Login here' : 'Register here'}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
