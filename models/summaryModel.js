import { query } from '../config/db.js';

export const getPlatformSummary = async () => {
  const [missionCounts, turtleCounts, successCounts] = await Promise.all([
    query('SELECT COUNT(*) AS total FROM missions_tb'),
    query('SELECT COUNT(*) AS total FROM turtles_tb'),
    query('SELECT COUNT(*) AS total FROM success_tb')
  ]);
  return {
    page_ready: true,
    missions: missionCounts[0]?.total || 0,
    turtles: turtleCounts[0]?.total || 0,
    successes: successCounts[0]?.total || 0
  };
};

export const getStats = async () => {
  const missionsByStatus = await query(
    'SELECT status, COUNT(*) AS total FROM missions_tb GROUP BY status'
  );
  const turtlesByStatus = await query(
    'SELECT status, COUNT(*) AS total FROM turtles_tb GROUP BY status'
  );
  const telemetryRate = await query(
    `SELECT DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') AS bucket, COUNT(*) AS readings
     FROM telemetry_tb
     WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
     GROUP BY bucket
     ORDER BY bucket`
  );
  return { missionsByStatus, turtlesByStatus, telemetryRate };
};

export default { getPlatformSummary, getStats };
