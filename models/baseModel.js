import { query } from '../config/db.js';

const sanitizeData = data =>
  Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );

const toAssignments = (data) => {
  const clean = sanitizeData(data);
  const keys = Object.keys(clean);
  const assignments = keys.map((key) => `\`${key}\` = ?`).join(', ');
  const values = keys.map((key) => clean[key]);
  return { assignments, values };
};

export const createModel = (tableName, primaryKey) => {
  const model = {};

  model.getAll = async (filters = {}) => {
    const clauses = [];
    const values = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      clauses.push(`\`${key}\` = ?`);
      values.push(value);
    });
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `SELECT * FROM \`${tableName}\` ${where} ORDER BY ${primaryKey} DESC`;
    return query(sql, values);
  };

  model.getById = async (id) => {
    const rows = await query(`SELECT * FROM \`${tableName}\` WHERE \`${primaryKey}\` = ? LIMIT 1`, [id]);
    return rows[0] || null;
  };

  model.create = async (data) => {
    const clean = sanitizeData(data);
    const keys = Object.keys(clean);
    if (!keys.length) {
      throw new Error('Cannot create record without data');
    }
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO \`${tableName}\` (${keys.map((k) => `\`${k}\``).join(', ')}) VALUES (${placeholders})`;
    const values = keys.map((key) => clean[key]);
    const result = await query(sql, values);
    return { [primaryKey]: result.insertId, ...clean };
  };

  model.update = async (id, data) => {
    const clean = sanitizeData(data);
    if (!Object.keys(clean).length) {
      return model.getById(id);
    }
    const { assignments, values } = toAssignments(clean);
    const sql = `UPDATE \`${tableName}\` SET ${assignments} WHERE \`${primaryKey}\` = ?`;
    await query(sql, [...values, id]);
    return model.getById(id);
  };

  model.remove = async (id) => {
    await query(`DELETE FROM \`${tableName}\` WHERE \`${primaryKey}\` = ?`, [id]);
    return { success: true };
  };

  return model;
};

export default createModel;
