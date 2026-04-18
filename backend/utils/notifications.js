const Notification = require('../models/Notification');

const createNotification = async ({ recipient, type, title, message, event, scheduledFor }) => {
  if (!recipient || !type || !title || !message) return null;

  return Notification.create({
    recipient,
    type,
    title,
    message,
    event,
    scheduledFor: scheduledFor || new Date(),
  });
};

const createManyNotifications = async (items = []) => {
  const payload = items.filter((item) => item && item.recipient && item.type && item.title && item.message);
  if (!payload.length) return [];
  return Notification.insertMany(payload.map((item) => ({
    scheduledFor: item.scheduledFor || new Date(),
    ...item,
  })));
};

module.exports = { createNotification, createManyNotifications };