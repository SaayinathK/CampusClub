import mongoose from 'mongoose';

export function getHealth(_req, res) {
  return res.json({
    status: 'ok',
    database:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
}
