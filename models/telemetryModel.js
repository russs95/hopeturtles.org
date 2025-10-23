import { query } from '../config/db.js';
import { createModel } from './baseModel.js';

const telemetryModel = createModel('telemetry_tb', 'telemetry_id');

telemetryModel.getByTurtleId = async (turtleId, limit = 50) => {
  const sql = `
    SELECT *
    FROM telemetry_tb
    WHERE turtle_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `;
  return query(sql, [turtleId, limit]);
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
