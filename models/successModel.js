import { query } from '../config/db.js';
import { createModel } from './baseModel.js';

const successModel = createModel('success_tb', 'success_id');

const toSafeLimit = (value, fallback, maximum = 100) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, maximum);
};

successModel.getRecent = async (limit = 12) => {
  const safeLimit = toSafeLimit(limit, 12);
  const sql = `
    SELECT s.*, t.name AS turtle_name
    FROM success_tb s
    LEFT JOIN turtles_tb t ON s.turtle_id = t.turtle_id
    ORDER BY s.date_found DESC
    LIMIT ${safeLimit}
  `;
  return query(sql);
};

export default successModel;
