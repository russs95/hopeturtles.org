import { query } from '../config/db.js';
import { createModel } from './baseModel.js';

const successModel = createModel('success_tb', 'success_id');

successModel.getRecent = async (limit = 12) => {
  const sql = `
    SELECT s.*, t.name AS turtle_name
    FROM success_tb s
    LEFT JOIN turtles_tb t ON s.turtle_id = t.turtle_id
    ORDER BY s.date_found DESC
    LIMIT ?
  `;
  return query(sql, [limit]);
};

export default successModel;
