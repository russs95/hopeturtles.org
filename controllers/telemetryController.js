import telemetryModel from '../models/telemetryModel.js';

export const getTelemetryForTurtle = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const telemetry = await telemetryModel.getByTurtleId(
      req.params.turtle_id,
      Number(limit) || 50
    );
    return res.json({ success: true, data: telemetry });
  } catch (error) {
    return next(error);
  }
};

export const getLatestTelemetry = async (req, res, next) => {
  try {
    const telemetry = await telemetryModel.getLatest();
    return res.json({ success: true, data: telemetry });
  } catch (error) {
    return next(error);
  }
};

export default {
  getTelemetryForTurtle,
  getLatestTelemetry
};
