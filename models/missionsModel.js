import { query } from '../config/db.js';
import { createModel } from './baseModel.js';

const missionsModel = createModel('missions_tb', 'mission_id');

missionsModel.getAllWithHub = async (filters = {}) => {
  const clauses = [];
  const values = [];
  if (filters.status) {
    clauses.push('m.status = ?');
    values.push(filters.status);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `
    SELECT m.*, h.name AS hub_name, h.lat AS hub_lat, h.lng AS hub_lng
    FROM missions_tb m
    LEFT JOIN hubs_tb h ON m.created_by = h.coordinator_id
    ${where}
    ORDER BY m.start_date DESC
  `;
  return query(sql, values);
};

missionsModel.getAllWithStats = async (filters = {}) => {
  const clauses = [];
  const values = [];
  if (filters.status) {
    clauses.push('m.status = ?');
    values.push(filters.status);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `
    SELECT
      m.*,
      (
        SELECT COUNT(*)
        FROM turtles_tb t
        WHERE t.mission_id = m.mission_id
      ) AS turtle_count,
      (
        SELECT COUNT(DISTINCT t.boat_id)
        FROM turtles_tb t
        WHERE t.mission_id = m.mission_id
          AND t.boat_id IS NOT NULL
      ) AS boat_count,
      (
        SELECT COUNT(b.bottle_id)
        FROM bottles_tb b
        INNER JOIN turtles_tb t2 ON b.turtle_id = t2.turtle_id
        WHERE t2.mission_id = m.mission_id
      ) AS bottle_count
    FROM missions_tb m
    ${where}
    ORDER BY COALESCE(m.start_date, m.created_at) DESC, m.mission_id DESC
  `;
  return query(sql, values);
};

missionsModel.getSummary = async () => {
  const statusCounts = await query(
    'SELECT status, COUNT(*) AS total FROM missions_tb GROUP BY status'
  );
  const total = statusCounts.reduce((acc, row) => acc + row.total, 0);
  return { total, statusCounts };
};

export default missionsModel;
