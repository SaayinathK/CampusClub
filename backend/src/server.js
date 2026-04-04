import 'dotenv/config';
import { app } from './app.js';
import { connectToDatabase } from './config/db.js';

const PORT = Number(process.env.PORT) || 5000;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`UniConnect auth server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB.', error.message);
    process.exit(1);
  });
