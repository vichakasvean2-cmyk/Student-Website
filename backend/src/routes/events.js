import { Router } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.search) {
      const term = String(req.query.search).trim();
      filter.$or = ['title', 'category', 'location'].map(key => ({ [key]: { $regex: term, $options: 'i' } }));
    }
    if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
    const events = await Event.find(filter).sort({ date: 1, time: 1 });
    res.json(events);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid event ID' });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const fields = ['title', 'category', 'date', 'time', 'location', 'organizer', 'description'];
    const missing = fields.filter(field => !String(req.body[field] || '').trim());
    if (missing.length) return res.status(400).json({ message: `Required fields: ${missing.join(', ')}` });
    const event = await Event.create(Object.fromEntries(fields.map(field => [field, String(req.body[field]).trim()])));
    res.status(201).json(event);
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid event ID' });
    const fields = ['title', 'category', 'date', 'time', 'location', 'organizer', 'description'];
    const update = Object.fromEntries(fields.filter(f => req.body[f] !== undefined).map(f => [f, String(req.body[f]).trim()]));
    const event = await Event.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid event ID' });
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) { next(error); }
});

export default router;
