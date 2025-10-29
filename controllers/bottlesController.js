import bottlesModel from '../models/bottlesModel.js';

export const listBottles = async (req, res, next) => {
  try {
    const bottles = await bottlesModel.getAll();
    return res.json({ success: true, data: bottles });
  } catch (error) {
    return next(error);
  }
};

export const getBottle = async (req, res, next) => {
  try {
    const bottle = await bottlesModel.getById(req.params.id);
    if (!bottle) {
      return res.status(404).json({ success: false, message: 'Bottle not found' });
    }
    return res.json({ success: true, data: bottle });
  } catch (error) {
    return next(error);
  }
};

export const createBottle = async (req, res, next) => {
  try {
    const bottle = await bottlesModel.create(req.body);
    return res.status(201).json({ success: true, data: bottle });
  } catch (error) {
    return next(error);
  }
};

export const updateBottle = async (req, res, next) => {
  try {
    const bottle = await bottlesModel.update(req.params.id, req.body);
    if (!bottle) {
      return res.status(404).json({ success: false, message: 'Bottle not found' });
    }
    return res.json({ success: true, data: bottle });
  } catch (error) {
    return next(error);
  }
};

export const deleteBottle = async (req, res, next) => {
  try {
    await bottlesModel.remove(req.params.id);
    return res.json({ success: true, data: null, message: 'Bottle removed' });
  } catch (error) {
    return next(error);
  }
};

export default {
  listBottles,
  getBottle,
  createBottle,
  updateBottle,
  deleteBottle
};
