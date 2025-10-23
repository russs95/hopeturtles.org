import { getPlatformSummary, getStats } from '../models/summaryModel.js';

export const fetchSummary = async (req, res, next) => {
  try {
    const summary = await getPlatformSummary();
    return res.json({ success: true, data: summary });
  } catch (error) {
    return next(error);
  }
};

export const fetchStats = async (req, res, next) => {
  try {
    const stats = await getStats();
    return res.json({ success: true, data: stats });
  } catch (error) {
    return next(error);
  }
};

export default {
  fetchSummary,
  fetchStats
};
