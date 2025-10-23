import alertsModel from '../models/alertsModel.js';

export const getAlerts = async (req, res, next) => {
  try {
    const alerts = await alertsModel.getAll();
    return res.json({ success: true, data: alerts });
  } catch (error) {
    return next(error);
  }
};

export const getActiveAlerts = async (req, res, next) => {
  try {
    const alerts = await alertsModel.getActive();
    return res.json({ success: true, data: alerts });
  } catch (error) {
    return next(error);
  }
};

export const createAlert = async (req, res, next) => {
  try {
    const alert = await alertsModel.create(req.body);
    return res.status(201).json({ success: true, data: alert });
  } catch (error) {
    return next(error);
  }
};

export const updateAlert = async (req, res, next) => {
  try {
    const alert = await alertsModel.update(req.params.id, req.body);
    return res.json({ success: true, data: alert });
  } catch (error) {
    return next(error);
  }
};

export const deleteAlert = async (req, res, next) => {
  try {
    await alertsModel.remove(req.params.id);
    return res.json({ success: true, data: null, message: 'Alert removed' });
  } catch (error) {
    return next(error);
  }
};

export default {
  getAlerts,
  getActiveAlerts,
  createAlert,
  updateAlert,
  deleteAlert
};
