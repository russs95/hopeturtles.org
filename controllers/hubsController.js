import hubsModel from '../models/hubsModel.js';

export const getHubs = async (req, res, next) => {
  try {
    const hubs = await hubsModel.getAll();
    return res.json({ success: true, data: hubs });
  } catch (error) {
    return next(error);
  }
};

export const createHub = async (req, res, next) => {
  try {
    const hub = await hubsModel.create(req.body);
    return res.status(201).json({ success: true, data: hub });
  } catch (error) {
    return next(error);
  }
};

export const updateHub = async (req, res, next) => {
  try {
    const hub = await hubsModel.update(req.params.id, req.body);
    return res.json({ success: true, data: hub });
  } catch (error) {
    return next(error);
  }
};

export const deleteHub = async (req, res, next) => {
  try {
    await hubsModel.remove(req.params.id);
    return res.json({ success: true, data: null, message: 'Hub removed' });
  } catch (error) {
    return next(error);
  }
};

export default {
  getHubs,
  createHub,
  updateHub,
  deleteHub
};
