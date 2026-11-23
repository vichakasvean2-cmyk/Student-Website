import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true, trim: true },
  organizer: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 3000 }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
