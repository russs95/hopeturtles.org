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

turtlesModel.getAllWithRelations = async () => {
  const sql = `
    SELECT
      t.turtle_id,
      t.name,
      t.status,
      t.profile_photo_id,
      t.last_update,
      t.mission_id,
      t.hub_id,
      t.boat_id,
      t.turtle_manager,
      m.name AS mission_name,
      h.name AS hub_name,
      b.name AS boat_name,
      COALESCE(
        NULLIF(TRIM(CONCAT_WS(' ', u.first_name, u.last_name)), ''),
        NULLIF(u.full_name, ''),
        u.email,
        ''
      ) AS manager_name,
      COALESCE(log_counts.log_count, 0) AS log_count,
      profile_photo.url AS profile_photo_url
    FROM turtles_tb t
    LEFT JOIN missions_tb m ON t.mission_id = m.mission_id
    LEFT JOIN hubs_tb h ON t.hub_id = h.hub_id
    LEFT JOIN boats_tb b ON t.boat_id = b.boat_id
    LEFT JOIN users_tb u ON t.turtle_manager = u.buwana_id
    LEFT JOIN photos_tb profile_photo ON profile_photo.photo_id = t.profile_photo_id
    LEFT JOIN (
      SELECT turtle_id, COUNT(*) AS log_count
      FROM telemetry_tb
      GROUP BY turtle_id
    ) AS log_counts ON log_counts.turtle_id = t.turtle_id
    ORDER BY t.turtle_id DESC
  `;
  return query(sql);
};

turtlesModel.getManagedWithRelations = async (managerId) => {
  if (!managerId) {
    return [];
  }

  const sql = `
    SELECT
      t.turtle_id,
      t.name,
      t.status,
      t.profile_photo_id,
      t.mission_id,
      t.hub_id,
      t.boat_id,
      t.turtle_manager,
      m.name AS mission_name,
      h.name AS hub_name,
      b.name AS boat_name,
      profile_photo.url AS profile_photo_url
    FROM turtles_tb t
    LEFT JOIN missions_tb m ON t.mission_id = m.mission_id
    LEFT JOIN hubs_tb h ON t.hub_id = h.hub_id
    LEFT JOIN boats_tb b ON t.boat_id = b.boat_id
    LEFT JOIN photos_tb profile_photo ON profile_photo.photo_id = t.profile_photo_id
    WHERE t.turtle_manager = ?
    ORDER BY t.turtle_id DESC
  `;

  return query(sql, [managerId]);
};

turtlesModel.getTelemetrySummary = async () => {
  const latestTimestamps = await query(
    `SELECT turtle_id, MAX(timestamp) AS last_contact FROM telemetry_tb GROUP BY turtle_id`
  );
  return latestTimestamps;
};

export default turtlesModel;
