import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Smartphone, Shield, Save } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle } from
'../../components/ui/Card';
import { Button } from '../../components/ui/Button';
const PreferenceToggle = ({
  title,
  description,
  checked,
  onChange
}) =>
<div className="flex items-start justify-between py-4">
    <div className="pr-4">
      <h4 className="text-sm font-medium text-slate-900">{title}</h4>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
    <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${checked ? 'bg-primary-600' : 'bg-gray-200'}`}>
    
      <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    
    </button>
  </div>;

export const Preferences = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [prefs, setPrefs] = useState({
    newEvents: true,
    registrationClosing: true,
    eventStarting: true,
    updates: true,
    cancellations: true,
    emailNotifications: true,
    pushNotifications: false
  });
  const handleToggle = (key) => (checked) => {
    // Prevent disabling all notification channels
    if (
    !checked && (
    key === 'emailNotifications' && !prefs.pushNotifications ||
    key === 'pushNotifications' && !prefs.emailNotifications))
    {
      alert('You must keep at least one notification channel active.');
      return;
    }
    setPrefs((prev) => ({
      ...prev,
      [key]: checked
    }));
  };
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Notification Preferences
        </h1>
        <p className="text-slate-500 mt-1">
          Manage how and when you receive notifications.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Bell className="w-5 h-5 text-slate-500" />
          <CardTitle>Event Alerts</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          <PreferenceToggle
            title="New Events in My Communities"
            description="Get notified when a community you follow posts a new event."
            checked={prefs.newEvents}
            onChange={handleToggle('newEvents')} />
          
          <PreferenceToggle
            title="Registration Closing Soon"
            description="Reminders when registration is about to close for events you might like."
            checked={prefs.registrationClosing}
            onChange={handleToggle('registrationClosing')} />
          
          <PreferenceToggle
            title="Event Starting Soon"
            description="Reminders 24 hours and 1 hour before your registered events start."
            checked={prefs.eventStarting}
            onChange={handleToggle('eventStarting')} />
          
          <PreferenceToggle
            title="Event Updates"
            description="Important updates like venue changes or schedule adjustments."
            checked={prefs.updates}
            onChange={handleToggle('updates')} />
          
          <PreferenceToggle
            title="Cancellations"
            description="Immediate alerts if an event you are registered for is cancelled."
            checked={prefs.cancellations}
            onChange={handleToggle('cancellations')} />
          
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Smartphone className="w-5 h-5 text-slate-500" />
          <CardTitle>Delivery Methods</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          <PreferenceToggle
            title="Email Notifications"
            description="Receive notifications at your university email address."
            checked={prefs.emailNotifications}
            onChange={handleToggle('emailNotifications')} />
          
          <PreferenceToggle
            title="Push Notifications"
            description="Receive notifications directly in your browser."
            checked={prefs.pushNotifications}
            onChange={handleToggle('pushNotifications')} />
          
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4 pt-4">
        {showSuccess &&
        <motion.span
          initial={{
            opacity: 0,
            x: 20
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          exit={{
            opacity: 0
          }}
          className="text-sm font-medium text-success-600">
          
            Preferences saved successfully!
          </motion.span>
        }
        <Button
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}>
          
          Save Preferences
        </Button>
      </div>
    </div>);

};
