import path from 'path';
import successModel from '../models/successModel.js';
import turtlesModel from '../models/turtlesModel.js';

export const getSuccessLog = async (req, res, next) => {
  try {
    const successEntries = await successModel.getRecent(24);
    return res.json({ success: true, data: successEntries });
  } catch (error) {
    return next(error);
  }
};

export const createSuccessEntry = async (req, res, next) => {
  try {
    const { turtle_id, thank_you_message, location_lat, location_lng, date_found } = req.body;
    const photos = [];
    if (req.file) {
      photos.push(path.join('/uploads', path.basename(req.file.path)));
    }
    const payload = {
      turtle_id: turtle_id ? Number(turtle_id) : null,
      thank_you_message,
      location_lat: location_lat ? Number(location_lat) : null,
      location_lng: location_lng ? Number(location_lng) : null,
      date_found: date_found || new Date(),
      photos: JSON.stringify(photos)
    };
    const created = await successModel.create(payload);
    return res.status(201).json({ success: true, data: created, message: 'Success logged' });
  } catch (error) {
    return next(error);
  }
};

export const renderSuccessPage = async (req, res, next) => {
  try {
    const entries = await successModel.getRecent(50);
    const turtles = await turtlesModel.getAll();
    return res.render('success', {
      pageTitle: 'Success Log',
      entries,
      turtles
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getSuccessLog,
  createSuccessEntry,
  renderSuccessPage
};
