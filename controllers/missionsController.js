import missionsModel from '../models/missionsModel.js';

const trimCoordinateQuotes = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const sanitized = String(value).trim().replace(/^"+|"+$/g, '');
  if (sanitized === '') {
    return null;
  }
  const parsed = Number.parseFloat(sanitized);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid coordinate value: ${value}`);
  }
  return parsed;
};

const sanitizeMissionPayload = (payload = {}) => {
  const clean = { ...payload };
  if ('target_lat' in clean) {
    clean.target_lat = trimCoordinateQuotes(clean.target_lat);
  }
  if ('target_lng' in clean) {
    clean.target_lng = trimCoordinateQuotes(clean.target_lng);
  }
  return clean;
};

export const getMissions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const missions = await missionsModel.getAllWithHub({ status });
    return res.json({ success: true, data: missions });
  } catch (error) {
    return next(error);
  }
};

export const getMissionById = async (req, res, next) => {
  try {
    const mission = await missionsModel.getById(req.params.id);
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found' });
    }
    return res.json({ success: true, data: mission });
  } catch (error) {
    return next(error);
  }
};

export const createMission = async (req, res, next) => {
  try {
    const mission = await missionsModel.create(sanitizeMissionPayload(req.body));
    return res.status(201).json({ success: true, data: mission });
  } catch (error) {
    return next(error);
  }
};

export const updateMission = async (req, res, next) => {
  try {
    const mission = await missionsModel.update(
      req.params.id,
      sanitizeMissionPayload(req.body)
    );
    return res.json({ success: true, data: mission });
  } catch (error) {
    return next(error);
  }
};

export const deleteMission = async (req, res, next) => {
  try {
    await missionsModel.remove(req.params.id);
    return res.json({ success: true, data: null, message: 'Mission removed' });
  } catch (error) {
    return next(error);
  }
};

export const renderExplorer = async (req, res, next) => {
  try {
    const missions = await missionsModel.getAllWithStats();
    return res.render('mission', {
      pageTitle: 'Missions Explorer',
      missions
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
  renderExplorer
};
