import missionsModel from '../models/missionsModel.js';
import hubsModel from '../models/hubsModel.js';

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
    const mission = await missionsModel.create(req.body);
    return res.status(201).json({ success: true, data: mission });
  } catch (error) {
    return next(error);
  }
};

export const updateMission = async (req, res, next) => {
  try {
    const mission = await missionsModel.update(req.params.id, req.body);
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
    const { status } = req.query;
    const missions = await missionsModel.getAllWithHub({ status });
    const hubs = await hubsModel.getAll();
    return res.render('mission', {
      pageTitle: 'Missions Explorer',
      missions,
      hubs
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
