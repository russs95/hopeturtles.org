import { query } from '../config/db.js';
import { createModel } from './baseModel.js';

const turtlesModel = createModel('turtles_tb', 'turtle_id');

turtlesModel.getAllDetailed = async () => {
  const sql = `
    SELECT t.*, m.name AS mission_name, h.name AS hub_name
    FROM turtles_tb t
    LEFT JOIN missions_tb m ON t.mission_id = m.mission_id
    LEFT JOIN hubs_tb h ON t.hub_id = h.hub_id
    ORDER BY t.created_at DESC
  `;
  return query(sql);
};

turtlesModel.getTelemetrySummary = async () => {
  const latestTimestamps = await query(
    `SELECT turtle_id, MAX(timestamp) AS last_contact FROM telemetry_tb GROUP BY turtle_id`
  );
  return latestTimestamps;
};

export default turtlesModel;
