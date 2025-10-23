import boatsModel from '../models/boatsModel.js';

export const getBoats = async (req, res, next) => {
  try {
    const boats = await boatsModel.getAll();
    return res.json({ success: true, data: boats });
  } catch (error) {
    return next(error);
  }
};

export const createBoat = async (req, res, next) => {
  try {
    const boat = await boatsModel.create(req.body);
    return res.status(201).json({ success: true, data: boat });
  } catch (error) {
    return next(error);
  }
};

export const updateBoat = async (req, res, next) => {
  try {
    const boat = await boatsModel.update(req.params.id, req.body);
    return res.json({ success: true, data: boat });
  } catch (error) {
    return next(error);
  }
};

export const deleteBoat = async (req, res, next) => {
  try {
    await boatsModel.remove(req.params.id);
    return res.json({ success: true, data: null, message: 'Boat removed' });
  } catch (error) {
    return next(error);
  }
};

export default {
  getBoats,
  createBoat,
  updateBoat,
  deleteBoat
};
