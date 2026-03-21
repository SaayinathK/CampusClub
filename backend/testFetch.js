const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Event = require('./models/Event');
const Community = require('./models/Community');
const User = require('./models/User');

async function test() {
  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
  const events = await Event.find({})
      .populate('community', 'name logo category')
      .populate('createdBy', 'name email')
      .select('-participants')
      .sort({ createdAt: -1 })
      .limit(500);
      
  console.log('type of events:', typeof events);
  console.log('is array:', Array.isArray(events));
  console.log('val:', events);
  process.exit(0);
}

test().catch(console.error);
