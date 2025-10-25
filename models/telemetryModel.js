import { query } from '../config/db.js';
import { createModel } from './baseModel.js';

const telemetryModel = createModel('telemetry_tb', 'telemetry_id');

const toSafeLimit = (value, fallback, maximum = 500) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, maximum);
};

telemetryModel.getByTurtleId = async (turtleId, limit = 50) => {
  const safeLimit = toSafeLimit(limit, 50);
  const sql = `
    SELECT *
    FROM telemetry_tb
    WHERE turtle_id = ?
    ORDER BY timestamp DESC
    LIMIT ${safeLimit}
  `;
  return query(sql, [turtleId]);
};

telemetryModel.getLatest = async () => {
  const sql = `
    SELECT t1.*
    FROM telemetry_tb t1
    INNER JOIN (
      SELECT turtle_id, MAX(timestamp) AS latest
      FROM telemetry_tb
      GROUP BY turtle_id
    ) t2 ON t1.turtle_id = t2.turtle_id AND t1.timestamp = t2.latest
  `;
  return query(sql);
};

export default telemetryModel;
